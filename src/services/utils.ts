/**
 * Removes trailing 'turtle' and any triple backticks from a string
 * @param message - The message string to parse.
 * @returns parsed message
 */
export function parseLLMOutput(message: string): string {
    const parsedMessage = message
        .replace(/(```(?:ttl)?|''')/gi, '')
        .replace(/^\s*turtle:?/i, '')
        .trim();
    return parsedMessage;
}

/**
 * Removes all lines that start with @ from a string
 * @param text - The input text string
 * @returns The text with lines starting with @ removed
 */
export function removeAtLines(text: string): string {
    return text
        .split('\n')
        .filter(line => !line.trim().startsWith('@') && line.length > 0)
        .join('\n');
}

/**
 * Writes the input to a debug log file with a timestamp in root
 */
import * as fs from 'fs';
import { LLM } from '../data/types';
import { logFilenames } from '../data/staticContent';
import { queryOpenRouter } from './llm/openRouter';
import { queryGemini } from './llm/gemini';
import { queryAzure } from './llm/azure';
export function writeToLog(filename: string, header: string, content: string | object): void {
    const file = fs.createWriteStream(`./logs/${filename}.log`, { flags: 'a' });
    if (typeof content === 'object') {
        content = JSON.stringify(content, null, 2); // Format object as JSON
    }
    file.write(`${new Date().toISOString()} - ${header}\n${content}\n`);
    file.end();
}

export function clearLog(filename: string): void {
    fs.writeFileSync(`./logs/${filename}.log`, '', 'utf8'); // Clear the log file
}

/**
 * Generates a knowledge graph using no prompt engineering by querying the specified Large Language Model (LLM) endpoint.
 *
 * Selects the appropriate system prompt based on the `shot` parameter and sends a request to the
 * corresponding LLM service (OpenRouter, Gemini, or Azure). The response is parsed and returned as a string.
 *
 * @param llm - The LLM configuration object specifying the endpoint and model ID.
 * @param shot - Determines which system prompt to use (0 for zero-shot, otherwise one-shot).
 * @param activityText - The activity description or context to provide to the LLM.
 * @param logFilename - (Optional) The filename to use for logging the request and response. Defaults to a miscellaneous log file.
 * @returns A promise that resolves to the generated TTL
 * @throws Will reject the promise if the LLM endpoint is unsupported.
 */
export async function requestKgGen(llm: LLM, systemPrompt: string, activityText: string, logFilename: string = logFilenames.misc): Promise<string> {
    let res: string;
    switch (llm.endpoint) {
        case 'openRouter':
            res = parseLLMOutput(await queryOpenRouter(llm.id, systemPrompt, activityText, logFilename))
            break;
        case 'gemini':
            res = parseLLMOutput(await queryGemini(llm.id, systemPrompt, activityText, logFilename));
            break;
        case 'azure':
            res = parseLLMOutput(await queryAzure(systemPrompt, activityText, logFilename));
            break;
        default:
            return Promise.reject(new Error("Unsupported LLM endpoint"));
    }
    return res;
}