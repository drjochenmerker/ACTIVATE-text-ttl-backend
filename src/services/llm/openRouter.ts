// src/routes/openRouter.ts
import 'dotenv/config';
import OpenAI from 'openai';
import { writeToLog } from '../utils.js';
import { logFilenames } from '../../data/staticContent.js';

/**
 * Generic function to query OpenRouter with a model, system prompt, and user prompt.
 * @param model openrouter model ID
 * @param systemPrompt system prompt
 * @param userPrompt user prompt
 * @returns message or 'error'
 */
export async function queryOpenRouter(model: string, systemPrompt: string, userPrompt: string, logFilename: string = logFilenames.misc): Promise<string> {
    const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_KEY,
    });
    try {
        const response = await openai.chat.completions.create({
            model: model,
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
        });
        writeToLog(logFilename, "OpenRouter Request: " + model, response)
        return response.choices[0].message.content || 'error';
    } catch (error) {
        console.error('Error querying OpenRouter:', error);
        return "error"
    }
}
