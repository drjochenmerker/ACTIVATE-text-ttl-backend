// src/routes/azure.ts
import { Router, Request, Response } from 'express';
import 'dotenv/config'
import { AzureOpenAI } from 'openai';
import { Model } from 'openai/resources/models';

/**
 * @swagger
 * /api/llm/azure/connectionTest:
 *   get:
 *     description: Tests the connection to Azure OpenAI
 *     tags: [Azure]
 *     responses:
 *       200:
 *         description: Successful connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   example: "Connection to OpenAI has been successfully established."
 */
const router = Router();

// Route to test the connection to the Gemini API
router.get('/connectionTest', async (req: Request, res: Response) => {
    const openai = new AzureOpenAI({
        endpoint: process.env.AZURE_OPENAI_URL,
        apiKey: process.env.AZURE_OPENAI_KEY,
        apiVersion: process.env.AZURE_OPENAI_VERSION,
        deployment: 'gpt-4o-mini'
    });
    const response = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: 'This is a connection Test. Confirm if the connection was successful.' },
            { role: 'user', content: 'Generate a short message confirming the connection to OpenAI.' }
        ],
        model: 'gpt-4o-mini',
        temperature: 1,
    })
    res.json({ message: response.choices[0].message });
});

/**
 * @swagger
 * /api/llm/azure/models:
 *   get:
 *     description: List the available models for OpenAI. They must first be deployed in Azure though
 *     tags: [Azure]
 *     responses:
 *       200:
 *         description: Avilable models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "gpt-35-turbo"
 */

// Route to list available models
router.get('/models', async (req: Request, res: Response) => {
    const openai = new AzureOpenAI({
        endpoint: process.env.AZURE_OPENAI_URL,
        apiKey: process.env.AZURE_OPENAI_KEY,
        apiVersion: process.env.AZURE_OPENAI_VERSION
    });
    const response = await openai.models.list();
    const modelList = response.data.filter((model) => model.id.includes('gpt')).map((model: Model) => model.id);
    res.json({ models: modelList });
});

export default router;
