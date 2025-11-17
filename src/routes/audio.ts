import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import crypto from 'crypto';
import { callGeminiAPI } from '../services/geminiMapper.js';

const router = express.Router();

const python_api_url = `${process.env.PYTHON_API_URL}:${process.env.PYTHON_API_PORT}`;

type JobStatus =
    | { status: 'processing'; progress: number; message: string }
    | { status: 'complete'; data: any } // 'data' ist hier das finale DiarizationSuccessResult
    | { status: 'error'; message: string };

const jobStore = new Map<string, JobStatus>();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os.tmpdir()); // save in temporary directory
    },
    filename: (req, file, cb) => {
        cb(null, `upload-${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2 GB Limit
});

// api endpoints

/**
 * @route POST /api/process-audio-session
 * NIMMT den Job entgegen, gibt eine Job-ID zurück und startet die Verarbeitung
 * im Hintergrund.
 */
router.post(
    '/process-audio-session',
    upload.single('audio_file'),
    async (req, res) => {
        
        console.log("Node-Backend: /process-audio-session aufgerufen.");

        try {
            const audioFile = req.file;
            const languageCode = req.body.language_code || null;
            let roles: string[] = JSON.parse(req.body.roles || '[]');

            if (!audioFile) {
                res.status(400).json({ success: false, message: "Keine 'audio_file' gefunden." });
                return;
            }

            // Job-ID erstellen
            const jobId = crypto.randomUUID();
            const jobData = {
                filePath: audioFile.path, // Pfad zur temporären Datei auf der Festplatte
                originalName: audioFile.originalname,
                languageCode: languageCode,
                roles: roles
            };

            // Job im Store speichern
            jobStore.set(jobId, { status: 'processing', progress: 0, message: 'Job gestartet...' });

            // SOFORT an das Frontend antworten
            res.status(202).json({ job_id: jobId }); // 202 = Accepted

            // Verarbeitung im Hintergrund starten (OHNE await)
            processAudioInBackground(jobId, jobData);

        } catch (error: any) {
            console.error("Fehler bei der Job-Annahme:", error.message);
            res.status(500).json({ success: false, message: "Fehler bei der Job-Annahme.", detail: error.message });
        }
    }
);

/**
 * @route GET /api/job-status/:job_id
 * WIRD vom Frontend wiederholt aufgerufen (Polling), um den Status abzufragen.
 */
router.get('/job-status/:job_id', (req, res) => {
    const jobId = req.params.job_id;
    const job = jobStore.get(jobId);

    if (!job) {
        res.status(404).json({ status: 'error', message: 'Job nicht gefunden.' });
        return;
    }

    // Wenn der Job fertig ist, senden wir die Daten und löschen den Job aus dem Speicher
    if (job.status === 'complete' || job.status === 'error') {
        jobStore.delete(jobId); 
    }

    res.status(200).json(job);
});

// --- Hintergrund-Verarbeitung (Die eigentliche Arbeit) ---

interface JobData {
    filePath: string;
    originalName: string;
    languageCode: string | null;
    roles: string[];
}

/**
 * Führt die gesamte (langsame) Verarbeitungs-Pipeline im Hintergrund aus.
 */
async function processAudioInBackground(jobId: string, jobData: JobData) {
    const { filePath, originalName, languageCode, roles } = jobData;
    const allFinalSegments: any[] = [];
    let totalDuration = 0;
    let detectedLanguage = languageCode || 'unknown';

    // Temporäres Verzeichnis für Chunks erstellen
    const chunkDir = path.join(os.tmpdir(), `job-${jobId}`);
    try {
        await fs.promises.mkdir(chunkDir);

        jobStore.set(jobId, { status: 'processing', progress: 10, message: 'Audio wird aufgeteilt...' });

        // --- 1. Audio in Chunks aufteilen (z.B. 5 Minuten / 300 Sekunden) ---
        const chunkFiles = await splitAudioWithFFmpeg(filePath, chunkDir, 300);
        const totalChunks = chunkFiles.length;
        console.log(`Job ${jobId}: Audio in ${totalChunks} Chunks aufgeteilt.`);

        // --- 2. Chunks nacheinander verarbeiten ---
        for (let i = 0; i < totalChunks; i++) {
            const chunkFile = chunkFiles[i];
            const progress = 10 + Math.round((i / totalChunks) * 80); // 10% -> 90%
            jobStore.set(jobId, { status: 'processing', progress: progress, message: `Transkribiere Teil ${i + 1} von ${totalChunks} (KI-Verarbeitung läuft...)` });

            // --- 3. Python-Backend aufrufen (Transkription & Diarisierung) ---
            const diarizationResult = await callPythonBackend(chunkFile.path, languageCode);
            
            if (i === 0) { // Sprache nur vom ersten Chunk nehmen
                detectedLanguage = diarizationResult.detected_language;
                totalDuration = 0; // Wir summieren die Dauer
            }
            totalDuration += diarizationResult.total_duration_s;

            // --- 4. Gemini-Backend aufrufen (Rollen-Mapping) ---
            const speakerTextMap = consolidateSpeakerText(diarizationResult.diarized_transcription);
            const roleMapping = await callGeminiAPI(speakerTextMap, roles);
            const speakerRoleMap = new Map<string, string>();
            roleMapping.forEach(m => speakerRoleMap.set(m.speaker_id, m.role));

            // --- 5. Ergebnisse zusammenführen ---
            const timeOffset = chunkFile.startTime; // Zeit-Offset für diesen Chunk
            const mappedSegments = mapSegments(diarizationResult.diarized_transcription, speakerRoleMap, timeOffset);
            allFinalSegments.push(...mappedSegments);
        }

        // --- 6. Job als "abgeschlossen" markieren ---
        jobStore.set(jobId, {
            status: 'complete',
            data: {
                status: "success",
                detected_language: detectedLanguage,
                diarized_transcription: allFinalSegments,
                total_duration_s: totalDuration,
                // (processing_times_s wird hier weggelassen, da es pro Chunk war)
            }
        });
        console.log(`Job ${jobId}: Erfolgreich abgeschlossen.`);

    } catch (error: any) {
        console.error(`Job ${jobId}: FEHLER bei der Hintergrundverarbeitung:`, error.message);
        jobStore.set(jobId, { status: 'error', message: error.message || "Unbekannter Verarbeitungsfehler." });
    
    } finally {
        // --- 7. Aufräumen ---
        fs.unlink(filePath, (err) => { // Original-Upload löschen
            if (err) console.error(`Job ${jobId}: Konnte Upload-Datei nicht löschen: ${filePath}`, err);
        });
        fs.rm(chunkDir, { recursive: true, force: true }, (err) => { // Chunk-Ordner löschen
            if (err) console.error(`Job ${jobId}: Konnte Chunk-Ordner nicht löschen: ${chunkDir}`, err);
        });
    }
}

// --- Hilfsfunktionen für die Hintergrundverarbeitung ---

/**
 * Ruft FFmpeg auf, um eine Audiodatei in Segmente zu zerlegen.
 * Gibt eine Liste von Dateipfaden und deren Startzeiten zurück.
 */
function splitAudioWithFFmpeg(inputFile: string, outputDir: string, segmentTimeSec: number): Promise<{ path: string; startTime: number }[]> {
    return new Promise((resolve, reject) => {
        const outputPattern = path.join(outputDir, 'chunk-%03d.wav'); // Erzeugt chunk-000.wav, chunk-001.wav, ...
        // -f segment: Teilt die Datei
        // -segment_time: Dauer jedes Chunks
        // -c copy: Kopiert den Audio-Codec (schnell), WENN das Format .wav ist.
        // Falls Sie .webm/.mp3 erlauben, müssen Sie '-c:a pcm_s16le' verwenden, um zu WAV zu konvertieren.
        // Da wir im Frontend zu WAV konvertieren, ist 'copy' sicher.
        const command = `ffmpeg -i "${inputFile}" -f segment -segment_time ${segmentTimeSec} -c copy "${outputPattern}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('FFmpeg-Fehler (split):', stderr);
                return reject(new Error(`FFmpeg-Fehler beim Aufteilen der Datei: ${stderr}`));
            }
            
            // Finde die erstellten Dateien
            fs.readdir(outputDir, (err, files) => {
                if (err) return reject(err);
                const chunkFiles = files
                    .filter(f => f.startsWith('chunk-') && f.endsWith('.wav'))
                    .map((file, index) => ({
                        path: path.join(outputDir, file),
                        startTime: index * segmentTimeSec // Zeit-Offset
                    }));
                resolve(chunkFiles);
            });
        });
    });
}

/**
 * Ruft das Python-Backend für einen einzelnen Chunk auf.
 */
async function callPythonBackend(filePath: string, languageCode: string | null): Promise<any> {
    const pythonApiUrl = `${process.env.PYTHON_API_URL}:${process.env.PYTHON_API_PORT}/api/diarize_and_transcribe`;
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);

    formData.append('audio_file', fileStream, {
        filename: path.basename(filePath), // z.B. chunk-001.wav
        contentType: 'audio/wav',
    });
    if (languageCode) {
         formData.append('language_code', languageCode);
    }

    const pythonResponse = await axios.post(
        pythonApiUrl,
        formData,
        { 
            headers: formData.getHeaders(),
            timeout: 30 * 60 * 1000 // 30 Min. Timeout pro Chunk
        }
    );
    
    if (pythonResponse.data.status !== 'success') {
         throw new Error(`Python-Dienst meldete Fehler für Chunk ${filePath}: ${pythonResponse.data.message}`);
    }
    return pythonResponse.data;
}

/**
 * Konsolidiert Text für Gemini (bleibt gleich).
 */
function consolidateSpeakerText(transcription: any[]): { [key: string]: string } {
    const speakerTextMap: { [key: string]: string } = {};
    for (const segment of transcription) {
        const speaker = segment.speaker;
        if (!speakerTextMap[speaker]) speakerTextMap[speaker] = "";
        speakerTextMap[speaker] += segment.text + " ";
    }
    return speakerTextMap;
}

/**
 * Wendet das Rollen-Mapping an und korrigiert Zeitstempel basierend auf dem Chunk-Offset.
 */
function mapSegments(transcription: any[], speakerRoleMap: Map<string, string>, timeOffset: number): any[] {
     return transcription.map((segment: any) => {
        const assignedRole = speakerRoleMap.get(segment.speaker);
        return {
            ...segment,
            speaker: assignedRole ? `${assignedRole} (${segment.speaker})` : segment.speaker,
            // Zeitstempel korrigieren
            start: segment.start + timeOffset,
            end: segment.end + timeOffset,
        };
    });
}

/**
 * @route POST /api/direct-diarization
 * Nimmt Audio entgegen, sendet es NUR an Python (Transkription + Diarisierung)
 * und gibt das Ergebnis direkt zurück (ohne Job-ID, ohne Gemini).
 */
router.post(
    '/direct-diarization',
    upload.single('audio_file'),
    async (req, res) => {
        console.log("Node-Backend: /direct-diarization aufgerufen.");

        // Temp-Pfad speichern, um ihn später sicher zu löschen
        let filePath: string | null = null;

        try {
            const audioFile = req.file;
            const languageCode = req.body.language_code || null;

            if (!audioFile) {
                res.status(400).json({ success: false, message: "Keine 'audio_file' gefunden." });
                return;
            }

            filePath = audioFile.path;

            // Wir nutzen einfach deine existierende Hilfsfunktion!
            // Sie ruft das Python-Backend auf und wartet auf die Antwort.
            const diarizationResult = await callPythonBackend(filePath, languageCode);

            // Ergebnis direkt an das Frontend zurücksenden
            res.status(200).json(diarizationResult);

        } catch (error: any) {
            console.error("Fehler bei direkter Diarisierung:", error.message);
            res.status(500).json({ 
                success: false, 
                message: "Fehler bei der Weiterleitung an den Python-Service.", 
                detail: error.message 
            });
        } finally {
            // WICHTIG: Aufräumen der temporären Upload-Datei
            if (filePath) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error(`Konnte Temp-Datei nicht löschen: ${filePath}`, err);
                });
            }
        }
    }
);


export default router;