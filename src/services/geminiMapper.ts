import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeToLog } from "./utils.js"; // Importieren Ihrer Logging-Funktion
import { logFilenames } from "../data/staticContent.js"; // Importieren Ihrer Log-Dateinamen

import { buildAudioTranscriptionPrompt } from "../data/prompts.js";
/**
 * JSON structure that is expected from Gemini API response
 */
interface RoleMapping {
    speaker_id: string; //  "SPEAKER_00"
    role: string; // student | teacher | actor | observer;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set in .env file - Role mapping will fail.");
}

// initialize Gemini model
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-09-2025",
    generationConfig: { responseMimeType: "application/json" }
});

/**
 * Calls gemini-api to map anonymous speakers (speaker_00) based on
 * heuristics and a predefined list of roles.
 *
 * @param speakerTextMap an object mapping speaker_id to the entire spoken text.
 * @param sessionRoles a list of roles available in the session (e.g., ['teacher', 'actor', ...])
 * @returns an array of RoleMapping objects.
 */
export async function callGeminiAPI(
    speakerTextMap: { [key: string]: string },
    sessionRoles: string[]
): Promise<RoleMapping[]> {

    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured on the server (.env).");
    }
    const userPrompt = JSON.stringify(speakerTextMap);

    const systemPrompt = buildAudioTranscriptionPrompt(sessionRoles);
    // Logging of the request
    writeToLog(logFilenames.misc, "Gemini Role Mapping Request (Data):", userPrompt);
    writeToLog(logFilenames.misc, "Gemini Role Mapping Request (Prompt):", systemPrompt);

    try {
        const result = await model.generateContent([systemPrompt, userPrompt]);
        const responseText = result.response.text();
        
        writeToLog(logFilenames.misc, "Gemini Role Mapping Response (Raw):", responseText);

        const jsonResponse: RoleMapping[] = JSON.parse(responseText);
        return jsonResponse;

    } catch (error) {
        console.error("Fehler beim Aufruf der Gemini-API oder beim Parsen der JSON-Antwort:", error);
        const safeError = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : (typeof error === 'object' && error !== null ? error : String(error));
        writeToLog(logFilenames.misc, "Gemini Role Mapping ERROR:", safeError);
        // fallback: if Gemini fails, we return an empty mapping
        // ("SPEAKER_00" etc.)
        return [];
    }
}