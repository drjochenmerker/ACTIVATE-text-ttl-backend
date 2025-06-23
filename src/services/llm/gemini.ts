// src/routes/gemini.ts
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { writeToLog } from '../utils';
import { logFilenames } from '../../data/staticContent';

/**
 * Generic function to query Gemini
 * @param model gemini model id
 * @param systemPrompt system prompt
 * @param userPrompt user prompt
 * @returns message or 'error'
 */
export async function queryGemini(model: string, systemPrompt: string, userPrompt: string, logFilename: string = logFilenames.misc): Promise<string> {
    const gemini = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    try {
        const response = await gemini.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.2
            }
        });
        writeToLog(logFilename, "Gemini Request", response)
        return response.text || 'error'
    } catch (error) {
        console.error('Error querying Gemini:', error);
        return "error"
    }
}
