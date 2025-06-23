// src/routes/azure.ts
import 'dotenv/config';
import { AzureOpenAI } from 'openai';
import { writeToLog } from '../utils';
import { logFilenames } from '../../data/staticContent';

/**
 * Generic function to query Azure OpenAI
 * @param systemPrompt System prompt
 * @param userPrompt User prompt
 * @returns Result or 'error'
 */
export async function queryAzure(model: string, systemPrompt: string, userPrompt: string, logFilename: string = logFilenames.misc): Promise<string> {
    let openai: AzureOpenAI;
    if (model === 'model-router') {
        openai = new AzureOpenAI({
            endpoint: process.env.AZURE_OPENAI_URL,
            apiKey: process.env.AZURE_MODEL_ROUTER_KEY,
            apiVersion: process.env.AZURE_OPENAI_VERSION,
            deployment: model,
        });
    } else if (model === 'gpt-4.1') {
        openai = new AzureOpenAI({
            endpoint: process.env.AZURE_OPENAI_URL,
            apiKey: process.env.AZURE_GPT41_KEY,
            apiVersion: process.env.AZURE_OPENAI_VERSION,
            deployment: model,
        });
    } else {
        return 'error'
    }
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
            model,
            temperature: 0.2,
        });
        writeToLog(logFilename, "Azure Request", response)
        return response.choices[0].message.content || 'error';
    } catch (error) {
        console.error('Error querying Azure OpenAI:', error);
        return 'error';
    }
}
