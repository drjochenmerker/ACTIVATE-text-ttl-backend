// src/routes/gemini.ts
import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config'

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
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents:
            'Generate a short message confirming the connection to Gemini.',
    });
    res.json({ message: response.text, model: response.modelVersion });
});

export default router;
