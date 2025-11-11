import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

// Importieren Sie Ihre Gemini-Aufruffunktion (Pfad muss ggf. angepasst werden)
// .js ist wichtig, wenn "type": "module" in package.json steht
import { callGeminiAPI } from '../services/geminiMapper.js'; 

const router = express.Router();

// --- Multer-Setup ---
// Speichert die Datei temporär im Speicher (RAM)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // Limit auf 100MB (für lange Audio-Dateien)
});

/**
 * @route POST /api/process-audio-session
 * @description Empfängt eine Audiodatei und eine Rollenliste.
 * 1. Leitet die Datei an das Python-Backend (Whisper auf Port 8001) weiter.
 * 2. Empfängt das diariserte Transkript (mit speaker_00).
 * 3. Ruft Gemini auf, um die Sprecher den Rollen zuzuordnen (Ihr Plan).
 * 4. Sendet das finale, zugeordnete Transkript an das Frontend zurück.
 */
router.post(
    '/process-audio-session',
    upload.single('audio_file'), // 'audio_file' muss der Feldname im FormData sein
    async (req, res) => {
        
        console.log("Node-Backend: /process-audio-session aufgerufen.");

        try {
            // --- 1. Daten aus der Anfrage extrahieren ---
            const audioFile = req.file;
            const languageCode = req.body.language_code || null;
            let roles: string[] = [];
            
            try {
                 // 'roles' wird als JSON-String im FormData erwartet
                 roles = JSON.parse(req.body.roles || '[]');
            } catch (e) {
                 console.error("Konnte 'roles'-Array nicht parsen:", req.body.roles);
                 return res.status(400).json({ success: false, message: "Ungültiges 'roles'-Format. Muss ein JSON-Array-String sein." });
            }

            if (!audioFile) {
                return res.status(400).json({ success: false, message: "Keine 'audio_file' im FormData gefunden." });
            }

            // --- 2. Schritt A: Python-Backend (Whisper) aufrufen ---
            // Ziel: Port 8001 (aus Ihrer package.json -> start-whisper)
            const pythonApiUrl = 'http://localhost:8001/api/diarize_and_transcribe';
            
            const formData = new FormData();
            
            // Konvertiere den Buffer von Multer in einen Stream, den FormData senden kann
            const bufferStream = new Readable();
            bufferStream.push(audioFile.buffer);
            bufferStream.push(null);

            // Füge die Datei zum Formular hinzu
            formData.append('audio_file', bufferStream, {
                filename: audioFile.originalname, // Wichtig für die Dateityp-Prüfung im Python-Backend
                contentType: audioFile.mimetype,
            });
            
            if (languageCode) {
                 formData.append('language_code', languageCode);
            }

            console.log(`Node-Backend: Sende Audio (${(audioFile.size / 1024 / 1024).toFixed(2)} MB) an Python-Server (${pythonApiUrl})...`);
            
            const pythonResponse = await axios.post(
                pythonApiUrl,
                formData,
                { 
                    headers: formData.getHeaders(),
                    maxContentLength: Infinity, // Wichtig für große Uploads
                    maxBodyLength: Infinity
                }
            );

            // Das Ergebnis vom Python-Server (mit speaker_0, speaker_1...)
            const diarizationResult = pythonResponse.data;

            if (diarizationResult.status !== 'success') {
                 // Fehler vom Python-Dienst abfangen
                 throw new Error(`Python-Dienst meldete einen Fehler: ${diarizationResult.detail || diarizationResult.message || 'Unbekannter Python-Fehler'}`);
            }
            
            console.log("Node-Backend: Transkription von Python empfangen.");

            // --- 3. Schritt B: Gemini-Backend (Rollen-Mapping) aufrufen ---
            
            // 3.1: Transkript konsolidieren (wie in Ihrem Plan beschrieben)
            const speakerTextMap: { [key: string]: string } = {};
            for (const segment of diarizationResult.diarized_transcription) {
                const speaker = segment.speaker; // z.B. "SPEAKER_00"
                if (!speakerTextMap[speaker]) {
                    speakerTextMap[speaker] = "";
                }
                speakerTextMap[speaker] += segment.text + " ";
            }

            console.log("Node-Backend: Rufe Gemini für Rollen-Mapping auf...");

            // 3.2: Gemini aufrufen (diese Funktion muss in 'geminiMapper.ts' existieren)
            const roleMapping = await callGeminiAPI(speakerTextMap, roles);
            
            console.log("Node-Backend: Rollen-Mapping von Gemini empfangen:", roleMapping);

            // 3.3: Erstelle eine Zuordnungstabelle (Map) für einfachen Zugriff
            const speakerRoleMap = new Map<string, string>();
            roleMapping.forEach(mapping => {
                speakerRoleMap.set(mapping.speaker_id, mapping.role);
            });

            // --- 4. Schritt C: Ergebnisse zusammenführen ---
            // Ersetze 'SPEAKER_00' durch die zugeordnete Rolle
            const finalTranscription = diarizationResult.diarized_transcription.map((segment: any) => {
                const assignedRole = speakerRoleMap.get(segment.speaker);
                return {
                    ...segment,
                    // Ersetze 'SPEAKER_00' durch 'Lehrperson (SPEAKER_00)' für Klarheit
                    speaker: assignedRole ? `${assignedRole} (${segment.speaker})` : segment.speaker,
                };
            });

            // --- 5. Schritt D: Antwort an das Frontend senden ---
            res.status(200).json({
                status: "success",
                detected_language: diarizationResult.detected_language,
                diarized_transcription: finalTranscription, // Das zugeordnete Transkript
                total_duration_s: diarizationResult.total_duration_s,
                role_mapping: roleMapping, // Die Zuordnungstabelle für Debugging/Anzeige
                processing_times_s: diarizationResult.processing_times_s // Verarbeitungszeiten weiterleiten
            });

        } catch (error: any) {
            console.error("Fehler im Orchestrierungs-Endpunkt /process-audio-session:", error.message);
            
            // Fehler vom Python-Server oder Gemini weiterleiten
            if (error.response) {
                console.error("Fehlerdetails (von Sub-Request):", error.response.data);
                return res.status(error.response.status || 500).json(error.response.data);
            }
            
            // Allgemeiner Fehler
            res.status(500).json({ success: false, message: "Internal Server Error in Orchestrator", detail: error.message });
        }
    }
);

export default router;