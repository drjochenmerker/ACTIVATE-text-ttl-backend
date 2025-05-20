// src/routes/openRouter.ts
import { Router, Request, Response } from 'express';
import 'dotenv/config'
import OpenAI from 'openai';

/**
 * @swagger
 * /api/llm/openRouter/connectionTest:
 *   get:
 *     description: Tests the connection to OpenRouter
 *     tags: [OpenRouter]
 *     parameters:
 *       - in: query
 *         name: model
 *         description: The model to test the connection with
 *         required: false
 *         schema:
 *           type: string
 *           example: "meta-llama/llama-3.3-8b-instruct:free"
 *     responses:
 *       200:
 *         description: Successful connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: "assistant"
 *                     content:
 *                       type: string
 *                       example: "Connected to Gemini! Ready to assist.\n"
 *                     refusal:
 *                       type: string
 *                       example: null
 *                     reasoning:
 *                       type: string 
 *                       example: null
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "The model must exist and be free to use."
 */
const router = Router();

// Route to test the connection to the Gemini API
router.get('/connectionTest', async (req: Request, res: Response) => {
    const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_KEY,
    });
    const model = req.query.model?.toString() || 'meta-llama/llama-3.3-8b-instruct:free';
    if (model.slice(-4) !== 'free') {
        res.status(400).json({ error: 'The model must exist and be free to use.' });
    }
    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            { role: 'system', content: 'This is a connection Test. Confirm if the connection was successful.' },
            { role: 'user', content: 'Generate a short message confirming the connection to OpenRouter.' }
        ],
    });
    res.json({ message: response.choices[0].message });
});

/**
 * @swagger
 * /api/llm/openRouter/models:
 *   get:
 *     description: List the available models for OpenRouter
 *     tags: [OpenRouter]
 *     responses:
 *       200:
 *         description: Available models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Meta: Llama 3.3 8B Instruct (free)"
 *                       id:
 *                         type: string
 *                         example: "meta-llama/llama-3.3-8b-instruct:free"
 */

// Route to list all available free models
router.get('/models', async (req: Request, res: Response) => {
    // List available models (GET /models)
    const response = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET"
    });
    const result = await response.json();
    res.json({
        models: result.data.filter((model: any) => model.name.includes('free')).map((model: any) => ({
            name: model.name,
            id: model.id,
        }))
    });
});

export default router;
