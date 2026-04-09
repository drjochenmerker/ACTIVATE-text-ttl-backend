import express from "express";
import multer from "multer";
import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import fs from "fs";
import os from "os";
import path from "path";
// import crypto from 'crypto';
import { writeToLog, queryLLM } from "../services/utils.js";
import { errorMessages, logFilenames } from "../data/staticContent.js";
import { roleSpeakerMappingTranscriptPrompt } from "../data/prompts.js";
import { exec } from "child_process";
import util from "util";
const execAsync = util.promisify(exec);

const router = express.Router();

// type JobStatus =
//     | { status: 'processing'; progress: number; message: string }
//     | { status: 'complete'; data: any } // 'data' ist hier das finale DiarizationSuccessResult
//     | { status: 'error'; message: string };

// const jobStore = new Map<string, JobStatus>();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os.tmpdir()); // save in temporary directory
    },
    filename: (req, file, cb) => {
        cb(null, `upload-${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB Limit
});

// api endpoint

/**
    calls the backend Python service for diarization and transcription
 */
async function callPythonBackend(
    filePath: string,
    languageCode: string | null
): Promise<AxiosResponse<unknown, unknown, object>> {
    // 1. Ensure the URL starts with http://
    // 2. Provide fallbacks so it doesn't evaluate to 'undefined'
    const host = process.env.PYTHON_API_URL;
    const port = process.env.PYTHON_API_PORT;

    const pythonApiUrl = `${host}:${port}/api/diarize_and_transcribe`;
    // const pythonApiUrl = `${process.env.PYTHON_API_URL}:${process.env.PYTHON_API_PORT}/api/diarize_and_transcribe`;
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);

    formData.append("audio_file", fileStream, {
        filename: path.basename(filePath), // e.g. chunk-001.wav
        contentType: "audio/wav",
    });
    if (languageCode) {
        formData.append("language_code", languageCode);
    }

    const pythonResponse = await axios.post(pythonApiUrl, formData, {
        headers: formData.getHeaders(),
        // timeout: 30 * 60 * 1000, // 30 minutes timeout
        timeout: 180 * 60 * 1000, // 3 hours timeout, for very long files
    });

    if (pythonResponse.data.status !== "success") {
        throw new Error(
            `Python service reported error for chunk ${filePath}: ${pythonResponse.data.message}`
        );
    }
    return pythonResponse.data;
}

/**
 * @route POST /api/direct-diarization
 * Accepts transcript as input, sends it ONLY to LLM for speaker role mapping
 * returns the result directly
 */
router.post("/audio/speaker-role-mapping", async (req, res) => {
    // transcript is already cut transcript to first utterance of each speaker
    // speaker id starts with 00 according to utterance, e.g. speaker_00, speaker_01, etc.
    // this problem leads to llm problems as it cannot recognize the pattern and cannot map roles to speakers correctly
    const transcript = req.body.diarizedTranscript;
    const llm = req.body.llm;
    if (!transcript) {
        res.status(200).json({
            error: errorMessages.missingFields,
        });
        return;
    }

    // map roles
    let geminiRes;
    writeToLog(
        logFilenames.misc,
        "Speaker Role Mapping - Input Transcript",
        transcript
    );

    geminiRes = await queryLLM(
        llm,
        roleSpeakerMappingTranscriptPrompt,
        transcript,
        logFilenames.misc
    );
    writeToLog(
        logFilenames.misc,
        "Speaker Role Mapping - Gemini Response",
        geminiRes
    );
    res.json({
        status: "done",
        res: geminiRes,
    });
}); /** * @route POST /api/direct-diarization
 * Accepts audio, converts if necessary, sends it to Python (transcription + diarization)
 */
router.post(
    "/direct-diarization",
    upload.single("audio_file"),
    async (req, res) => {
        console.log("/direct-diarization called");

        // let filePath: string | null = null;
        let originalFilePath: string | null = null;
        let processedFilePath: string | null = null;

        try {
            const audioFile = req.file;
            const languageCode = req.body.language_code || null;

            if (!audioFile) {
                res.status(400).json({
                    success: false,
                    message: "Keine 'audio_file' gefunden.",
                });
                return;
            }

            originalFilePath = audioFile.path;
            processedFilePath = `${audioFile.path}_processed.wav`;

            console.log(
                "Node-Backend: Starte Audio-Optimierung und Konvertierung via FFmpeg..."
            );

            // audio cleaning with ffmpeg
            // 1. highpass=f=100: Removes low rumble (wind, mic handling)
            // 2. afftdn: Reduces constant background noise (hissing, hum)
            // 3. dynaudnorm: Dynamic audio normalisation (levels out volume differences)
            // 4. -ar 16000 -ac 1: 16kHz Mono (Ideal for Whisper and Pyannote)
            const ffmpegCommand = `ffmpeg -y -i "${originalFilePath}" -af "highpass=f=100,afftdn,dynaudnorm" -ar 16000 -ac 1 -c:a pcm_s16le "${processedFilePath}"`;
            console.log("FFmpeg command:", ffmpegCommand);

            await execAsync(ffmpegCommand);
            console.log("Node-Backend: Audio-Optimierung erfolgreich.");

            // calls the Python backend and waits for the response
            // MAKE SURE to pass processedFilePath, not originalFilePath
            const diarizationResult = await callPythonBackend(
                processedFilePath,
                languageCode
            );

            // Send the result directly back to the frontend
            res.status(200).json(diarizationResult);
        } catch (error: unknown) {
            console.error(
                "Error during direct diarization:",
                (error as Error).message
            );
            writeToLog(
                logFilenames.audio,
                "Error during direct diarization: ",
                (error as Error).message
            );
            res.status(500).json({
                success: false,
                message: "Error forwarding to the Python service.",
                detail: (error as Error).message,
            });
        } finally {
            // !! Clean up the temporary files
            if (originalFilePath) {
                fs.unlink(originalFilePath, (err) => {
                    if (err)
                        console.error(
                            `Could not delete original temp file: ${originalFilePath}`,
                            err
                        );
                });
            }
            if (processedFilePath) {
                fs.unlink(processedFilePath, (err) => {
                    if (err)
                        console.error(
                            `Could not delete processed temp file: ${processedFilePath}`,
                            err
                        );
                });
            }
        }
    }
);

export default router;
