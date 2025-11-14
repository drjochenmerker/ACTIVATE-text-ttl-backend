import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

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
import { LLM } from '../data/types.js';
import { logFilenames } from '../data/staticContent.js';
export function writeToLog(filename: string, header: string, content: string | object): void {
    // Ensure the logs directory exists
    if (!fs.existsSync('./logs')) {
        fs.mkdirSync('./logs', { recursive: true });
    }
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
 * Generates a KG by querying the specified Large Language Model (LLM) endpoint.
 */
export async function requestKgGen(llm: LLM, systemPrompt: string, activityText: string, logFilename: string = logFilenames.misc): Promise<string> {
    // calls the updated queryGemini function
    const res = await queryGemini(llm.id, systemPrompt, activityText, logFilename);
    if (res === "error") {
        throw new Error("Error querying LLM for knowledge graph generation.");
    } else{
        return parseLLMOutput(res);
    }
}

// helper function to introduce delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic function to query Gemini
 * @param model gemini model id
 * @param systemPrompt system prompt
 * @param userPrompt user prompt
 * @returns message or 'error'
 */
async function queryGemini(model: string, systemPrompt: string, userPrompt: string, logFilename: string = logFilenames.misc): Promise<string> {
    const gemini = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    const MAX_RETRIES = 4; // todo: adjust number of retries --> make flexible for different LLM keys (paid versions)
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await gemini.models.generateContent({
                model: model,
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.2
                }
            });
            writeToLog(logFilename, "Gemini Request (Success)", response)
            console.log("result from gemini:", response.text);
            return response.text || 'error';

        } catch (error: any) {
            console.error(`Error querying Gemini (Attempt ${attempt}/${MAX_RETRIES}):`, error.message);
            lastError = error; // save latest error

            // test if error message contains '503' or 'overloaded' or 'unavailable'
            const errorMessage = (error.message || "").toLowerCase();
            if (errorMessage.includes("503") || errorMessage.includes("overloaded") || errorMessage.includes("unavailable")) {
                
                if (attempt < MAX_RETRIES) {
                    const delayTime = Math.pow(2, attempt) * 1000; 
                    console.log(`Gemini is overloaded. Retrying in ${delayTime / 1000}s...`);
                    await delay(delayTime);
                }
            } else { // 503 error -> bad request 
                break; 
            }
        }
    }

    // if everything failed
    console.error('All Gemini retries failed.');
    if (lastError) writeToLog(logFilename, "Gemini FINAL ERROR", lastError.message);
    return "error"; 
}