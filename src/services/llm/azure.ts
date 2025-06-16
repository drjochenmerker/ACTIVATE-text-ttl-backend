// src/routes/azure.ts
import { Router, Request, Response } from 'express';
import 'dotenv/config';
import { AzureOpenAI } from 'openai';
import { Model } from 'openai/resources/models';
import { writeToLog } from '../utils';
import { logFilenames } from '../../data/staticContent';

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
    if (!process.env.AZURE_DEPLOYMENT) {
        res.json({
            status: 501,
            message: 'Error: Azure deployment is not set',
        });
    } else {
        const openai = new AzureOpenAI({
            endpoint: process.env.AZURE_OPENAI_URL,
            apiKey: process.env.AZURE_OPENAI_KEY,
            apiVersion: process.env.AZURE_OPENAI_VERSION,
            deployment: process.env.AZURE_DEPLOYMENT,
        });
        const response = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'This is a connection Test. Confirm if the connection was successful.',
                },
                {
                    role: 'user',
                    content:
                        'Generate a short message confirming the connection to OpenAI.',
                },
            ],
            model: process.env.AZURE_DEPLOYMENT,
            temperature: 1,
        });
        res.json({
            message: response.choices[0].message,
        });
    }
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
        apiVersion: process.env.AZURE_OPENAI_VERSION,
    });
    const response = await openai.models.list();
    const modelList = response.data
        .filter((model) => model.id.includes('gpt'))
        .map((model: Model) => model.id);
    res.json({ models: modelList });
});

/**
 * Generic function to query Azure OpenAI
 * @param systemPrompt System prompt
 * @param userPrompt User prompt
 * @returns Result or 'error'
 */
export async function queryAzure(systemPrompt: string, userPrompt: string, logFilename: string = logFilenames.misc): Promise<string> {
    if (!process.env.AZURE_DEPLOYMENT) {
        return 'error'
    } else {
        const openai = new AzureOpenAI({
            endpoint: process.env.AZURE_OPENAI_URL,
            apiKey: process.env.AZURE_OPENAI_KEY,
            apiVersion: process.env.AZURE_OPENAI_VERSION,
            deployment: process.env.AZURE_DEPLOYMENT,
        });
        try {
            const response = await openai.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: userPrompt,
                    },
                ],
                model: process.env.AZURE_DEPLOYMENT,
                temperature: 0.2,
            });
            writeToLog(logFilename, "Azure Request", response)
            return response.choices[0].message.content || 'error';
        } catch (error) {
            console.error('Error querying Azure OpenAI:', error);
            return 'error';
        }
    }
}

export default router;
