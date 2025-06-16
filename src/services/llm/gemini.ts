// src/routes/gemini.ts
import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { writeToLog } from '../utils';
import { logFilenames } from '../../data/staticContent';

/**
 * @swagger
 * /api/llm/gemini/connectionTest:
 *   get:
 *     description: Tests the connection to Gemini
 *     tags: [Gemini]
 *     responses:
 *       200:
 *         description: Successful connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connected to Gemini! Ready to assist.\n"
 *                 model:
 *                   type: string
 *                   example: "gemini-2.0-flash"
 */
const router = Router();

// Route to test the connection to the Gemini API
router.get('/connectionTest', async (req: Request, res: Response) => {
    const gemini = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents:
            'Generate a short message confirming the connection to Gemini.',
    });
    res.json({
        message: response.text,
        model: response.modelVersion,
    });
});

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

export default router;
