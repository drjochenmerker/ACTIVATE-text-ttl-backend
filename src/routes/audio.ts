import express from "express";
import multer from "multer";
import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import fs from "fs";
import os from "os";
import path from "path";
// import { exec } from 'child_process';
// import crypto from 'crypto';
// import { callGeminiAPI } from '../services/geminiMapper.js';
import { requestRoleMapping, writeToLog } from "../services/utils.js";
// import { queryGemini, requestRoleMapping, writeToLog } from '../services/utils.js';
import { errorMessages, logFilenames } from "../data/staticContent.js";
import { geminiDetail } from "../data/resources.js";
import { roleSpeakerMappingTranscriptPrompt } from "../data/prompts.js";

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

// api endpoints

/**
 * @route POST /api/process-audio-session
    accepts an audio file and roles, starts background processing and immediately returns a job ID
 */
// router.post(
//     '/process-audio-session',
//     upload.single('audio_file'),
//     async (req, res) => {

//         console.log("Node-Backend: /process-audio-session aufgerufen.");

//         try {
//             const audioFile = req.file;
//             const languageCode = req.body.language_code || null;
//             let roles: string[] = JSON.parse(req.body.roles || '[]');

//             if (!audioFile) {
//                 res.status(400).json({ success: false, message: "Keine 'audio_file' gefunden." });
//                 return;
//             }

//             const jobId = crypto.randomUUID();
//             const jobData = {
//                 filePath: audioFile.path, // path to the uploaded file
//                 originalName: audioFile.originalname,
//                 languageCode: languageCode,
//                 roles: roles
//             };
//             // console.log("DEBUG: jobdata ", jobData);

//             jobStore.set(jobId, { status: 'processing', progress: 0, message: 'Job gestartet...' });

//             res.status(202).json({ job_id: jobId });

//             processAudioInBackground(jobId, jobData);

//         } catch (error: any) {
//             console.error("Fehler bei der Job-Annahme:", error.message);
//             res.status(500).json({ success: false, message: "Fehler bei der Job-Annahme.", detail: error.message });
//         }
//     }
// );

/**
 * @route GET /api/job-status/:job_id
 * is called by the frontend to check the status of a processing job
 */
// router.get('/job-status/:job_id', (req, res) => {
//     const jobId = req.params.job_id;
//     const job = jobStore.get(jobId);

//     if (!job) {
//         res.status(404).json({ status: 'error', message: 'Job nicht gefunden.' });
//         return;
//     }

//     if (job.status === 'complete' || job.status === 'error') {
//         jobStore.delete(jobId);
//     }

//     res.status(200).json(job);
// });

// Background processing

// interface JobData {
//     filePath: string;
//     originalName: string;
//     languageCode: string | null;
//     roles: string[];
// }

// async function processAudioInBackground(jobId: string, jobData: JobData) {
//     const { filePath, originalName, languageCode, roles } = jobData;
//     const allFinalSegments: any[] = [];
//     let totalDuration = 0;
//     let detectedLanguage = languageCode || 'unknown';

//     // Create tmp directory for chunks
//     const chunkDir = path.join(os.tmpdir(), `job-${jobId}`);
//     try {
//         await fs.promises.mkdir(chunkDir);

//         jobStore.set(jobId, { status: 'processing', progress: 10, message: 'Audio wird aufgeteilt...' });

//         // 1. split audio into chunks (300s each)
//         const chunkFiles = await splitAudioWithFFmpeg(filePath, chunkDir, 300);
//         const totalChunks = chunkFiles.length;
//         console.log(`Job ${jobId}: Audio in ${totalChunks} Chunks aufgeteilt.`);

//         // 2. process chunks sequentially
//         for (let i = 0; i < totalChunks; i++) {
//             const chunkFile = chunkFiles[i];
//             const progress = 10 + Math.round((i / totalChunks) * 80); // 10% -> 90%
//             jobStore.set(jobId, { status: 'processing', progress: progress, message: `Transcribing part ${i + 1} of ${totalChunks} (AI processing in progress...)` });
//             // 3. call Python backend (transcription & diarization)
//             const diarizationResult = await callPythonBackend(chunkFile.path, languageCode);

//             if (i === 0) {
//                 detectedLanguage = diarizationResult.detected_language;
//                 totalDuration = 0;
//             }
//             totalDuration += diarizationResult.total_duration_s;

//             // 4. call Gemini backend (role mapping)
//             const speakerTextMap = consolidateSpeakerText(diarizationResult.diarized_transcription);
//             const roleMapping = await callGeminiAPI(speakerTextMap, roles);
//             const speakerRoleMap = new Map<string, string>();
//             roleMapping.forEach(m => speakerRoleMap.set(m.speaker_id, m.role));

//             // 5. merge results
//             const timeOffset = chunkFile.startTime;
//             const mappedSegments = mapSegments(diarizationResult.diarized_transcription, speakerRoleMap, timeOffset);
//             allFinalSegments.push(...mappedSegments);
//         }

//         // 6. mark job as "complete"
//         jobStore.set(jobId, {
//             status: 'complete',
//             data: {
//                 status: "success",
//                 detected_language: detectedLanguage,
//                 diarized_transcription: allFinalSegments,
//                 total_duration_s: totalDuration,
//             }
//         });
//         console.log(`Job ${jobId}: Erfolgreich abgeschlossen.`);

//     } catch (error: any) {
//         console.error(`Job ${jobId}: ERROR during background processing:`, error.message);
//         jobStore.set(jobId, { status: 'error', message: error.message || "Unknown processing error." });

//     } finally {
//         // 7. clean up
//         fs.unlink(filePath, (err) => { // Delete original upload
//             if (err) console.error(`Job ${jobId}: Could not delete upload file: ${filePath}`, err);
//         });
//         fs.rm(chunkDir, { recursive: true, force: true }, (err) => { // Delete chunk directory
//             if (err) console.error(`Job ${jobId}: Could not delete chunk directory: ${chunkDir}`, err);
//         });
//     }
// }

// --- Helper functions for background processing ---

/**
 * Calls ffmpeg to split an audio file into segments.
 * returns list of file paths and their start times.
 */
// function splitAudioWithFFmpeg(inputFile: string, outputDir: string, segmentTimeSec: number): Promise<{ path: string; startTime: number }[]> {
//     return new Promise((resolve, reject) => {
//         const outputPattern = path.join(outputDir, 'chunk-%03d.wav'); // Creates chunk-000.wav, chunk-001.wav, ...
//         // -f segment: Splits the file
//         // -segment_time: duration of each segment in seconds
//         // -c copy: Copies the audio codec (fast), IF the format is .wav.
//         // if .webm/.mp3 is allowed, you need to use '-c:a pcm_s16le' to convert to WAV.
//         // Since we convert to WAV in the frontend, 'copy' is safe.
//         const command = `ffmpeg -i "${inputFile}" -f segment -segment_time ${segmentTimeSec} -c copy "${outputPattern}"`;

//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error('FFmpeg error (split):', stderr);
//                 return reject(new Error(`FFmpeg error while splitting file: ${stderr}`));
//             }

//             // Find the created files
//             fs.readdir(outputDir, (err, files) => {
//                 if (err) return reject(err);
//                 const chunkFiles = files
//                     .filter(f => f.startsWith('chunk-') && f.endsWith('.wav'))
//                     .map((file, index) => ({
//                         path: path.join(outputDir, file),
//                         startTime: index * segmentTimeSec // time offset
//                     }));
//                 resolve(chunkFiles);
//             });
//         });
//     });
// }

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
        timeout: 30 * 60 * 1000, // 30 minutes timeout
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
    geminiRes = await requestRoleMapping(
        geminiDetail,
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
});

/**
 * @route POST /api/direct-diarization
 * Accepts audio, sends it ONLY to Python (transcription + diarization)
 * and returns the result directly (without job ID, without Gemini).
 */
router.post(
    "/direct-diarization",
    upload.single("audio_file"),
    async (req, res) => {
        console.log("Node-Backend: /direct-diarization called.");

        // Store temp path to safely delete it later
        let filePath: string | null = null;

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

            filePath = audioFile.path;

            // calls the Python backend and waits for the response
            const diarizationResult = await callPythonBackend(
                filePath,
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
            // IMPORTANT: Clean up the temporary upload file
            if (filePath) {
                fs.unlink(filePath, (err) => {
                    if (err)
                        console.error(
                            `Could not delete temp file: ${filePath}`,
                            err
                        );
                });
            }
        }
    }
);

export default router;
