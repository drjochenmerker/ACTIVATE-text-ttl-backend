// /**
//  * Removes trailing 'turtle' and any triple backticks from a string
//  * @param message - The message string to parse.
//  * @returns parsed message
//  */
// export function parseLLMOutput(message: string): string {
//   const parsedMessage = message
//     .replace(/(```(?:ttl)?|''')/gi, '')
//     .replace(/^\s*turtle:?/i, '')
//     .trim();
//   return parsedMessage;
// }

// /**
//  * Removes all lines that start with @ from a string
//  * @param text - The input text string
//  * @returns The text with lines starting with @ removed
//  */
// export function removeAtLines(text: string): string {
//   return text
//     .split('\n')
//     .filter((line) => !line.trim().startsWith('@') && line.length > 0)
//     .join('\n');
// }

// /**
//  * Writes the input to a debug log file with a timestamp in root
//  */
// import * as fs from 'fs';
// import { LLM } from '../data/types.js';
// import { logFilenames } from '../data/staticContent.js';

// export function writeToLog(filename: string, header: string, content: string | object): void {
//   if (!fs.existsSync('./logs')) {
//     fs.mkdirSync('./logs', { recursive: true });
//   }
//   const file = fs.createWriteStream(`./logs/${filename}.log`, { flags: 'a' });
//   if (typeof content === 'object') {
//     content = JSON.stringify(content, null, 2);
//   }
//   file.write(`${new Date().toISOString()} - ${header}\n${content}\n`);
//   file.end();
// }

// export function clearLog(filename: string): void {
//   fs.writeFileSync(`./logs/${filename}.log`, '', 'utf8');
// }

// /**
//  * Generates a knowledge graph by querying the specified LLM endpoint.
//  */
// export async function requestKgGen(
//   llm: LLM,
//   systemPrompt: string,
//   activityText: string,
//   logFilename: string = logFilenames.misc
// ): Promise<string> {
//   return parseLLMOutput(await queryGemini(llm.id, systemPrompt, activityText, logFilename));
// }

// import 'dotenv/config';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// /**
//  * Generic function to query Gemini safely with retries and timeout handling.
//  */

// /**
//  * Generic function to query Gemini safely with retries and timeout handling.
//  */
// async function queryGemini(
//   model: string,
//   systemPrompt: string,
//   userPrompt: string,
//   logFilename: string = logFilenames.misc
// ): Promise<string> {
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

//   const modelInstance = genAI.getGenerativeModel({
//     model,
//     systemInstruction: systemPrompt, // can be string in latest SDK
//     generationConfig: { temperature: 0.2 },
//   });

//   const maxRetries = 3;
//   const retryDelayMs = 2000;
//   const timeoutMs = 400000;

//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       const timeoutPromise = new Promise<never>((_, reject) =>
//         setTimeout(() => reject(new Error('Gemini request timeout')), timeoutMs)
//       );

//       // ✅ Pass prompt directly as string
//       const responsePromise = modelInstance.generateContent(userPrompt);

//       const response = (await Promise.race([responsePromise, timeoutPromise])) as any;

//       const text = response?.response?.candidates?.[0]?.content?.[0]?.text || response?.text || '';

//       writeToLog(logFilename, `Gemini Request Success (attempt ${attempt})`, text);

//       if (!text) throw new Error('Empty Gemini output');
//       return text;
//     } catch (err: any) {
//       writeToLog(logFilename, `Gemini Request Failed (attempt ${attempt})`, err.message);
//       console.error(`Gemini attempt ${attempt} failed:`, err.message);

//       if (attempt === maxRetries) return 'error';
//       await new Promise((r) => setTimeout(r, retryDelayMs));
//     }
//   }

//   return 'error';
// }



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

export type LLMQueryResult = {
    ok: boolean;
    response?: string;
    error?: string;
}

/**
 * Queries the specified Large Language Model (LLM) endpoint.
 *
 * Selects the appropriate LLM service based on the `selectedProvider` parameter and sends a request to the
 * corresponding LLM service (Gemini, ChatGPT, or Claude). The response is parsed and returned as a string.
 *
 * @param llm - The LLM configuration object specifying the endpoint and model ID.
 * @param systemPrompt - The system prompt to use.
 * @param activityText - The activity description or context to provide to the LLM.
 * @param logFilename - (Optional) The filename to use for logging the request and response. Defaults to a miscellaneous log file.
 * @returns A promise that resolves to a structured LLM query result.
 */
export async function queryLLM(llm: LLM, systemPrompt: string, activityText: string | string[], logFilename: string = logFilenames.misc): Promise<LLMQueryResult> {

    let llmOutput: LLMQueryResult = { ok: false, error: 'Unsupported LLM provider' };
    switch (llm.selectedProvider) {
        case 'gemini':
            llmOutput = await queryGemini(llm, systemPrompt, <string>activityText, logFilename);
            break;
        case 'cortecs':
            llmOutput = await queryCortecs(llm, systemPrompt, <string>activityText, logFilename);
            break;
        case 'chatgpt':
            llmOutput = await queryChatGPT(llm, systemPrompt, <string[]>activityText, logFilename);
            break;
        case 'claude':
            llmOutput = await queryClaude(llm, systemPrompt, <string>activityText, logFilename);
            break;
        default:
            break;
    }

    if (!llmOutput.ok || !llmOutput.response) {
        return {
            ok: false,
            error: llmOutput.error || 'Unknown LLM error',
        };
    }

    return {
        ok: true,
        response: parseLLMOutput(llmOutput.response),
    };
}

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

/**
 * Generic function to query Gemini
 * @param model gemini model
 * @param systemPrompt system prompt
 * @param userPrompt user prompt
 * @returns message or 'error'
 */
/**
 * Generic function to query Gemini safely with retries and timeout handling.
 */
async function queryGemini(model: LLM, systemPrompt: string, userPrompt: string, logFilename: string = logFilenames.misc): Promise<LLMQueryResult> {
    const gemini = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    try {
        const response = await gemini.models.generateContent({
            model: model.modelName,
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                temperature: model.temperature
            }
        });
        writeToLog(logFilename, "Gemini Request", response)
        if (!response.text) {
            return { ok: false, error: 'Empty response from Gemini' };
        }
        return { ok: true, response: response.text };
    } catch (error) {
        console.error('Error querying Gemini:', error);
        return { ok: false, error: (error as Error).message || 'unknown-error' };
    }
}

import Anthropic from '@anthropic-ai/sdk';

/**
 * Generic function to query Claude
 * @param model Claude model
 * @param systemPrompt system prompt
 * @param userPrompt user prompt
 * @returns message or 'error'
 */
/**
 * Generic function to query Claude safely with retries and timeout handling.
 */
async function queryClaude(model: LLM, systemPrompt: string, userPrompt: string, logFilename: string = logFilenames.misc): Promise<LLMQueryResult> {
    const claude = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    try {
        const message = await claude.messages.create({
            max_tokens: 1024,
            messages: [{ role: 'user', content: userPrompt }],
            model: model.modelName,
            system: systemPrompt,
            temperature: model.temperature,
        });

        writeToLog(logFilename, "Claude Request", message)
        const text = (message.content[0] as Anthropic.TextBlock).text;
        if (!text) {
            return { ok: false, error: 'Empty response from Claude' };
        }
        return { ok: true, response: text };
    } catch (error) {
        console.error('Error querying Claude:', error);
        return { ok: false, error: (error as Error).message || 'unknown-error' };
    }
}

import OpenAI from 'openai';

/**
 * Generic function to query ChatGPT
 * @param model ChatGPT model
 * @param systemPrompt system prompt
 * @param userPrompt user prompt
 * @returns message or 'error'
 */
/**
 * Generic function to query ChatGPT safely with retries and timeout handling.
 */
async function queryChatGPT(model: LLM, systemPrompt: string, userPrompt: string | string[], logFilename: string = logFilenames.misc): Promise<LLMQueryResult> {

    const chatgpt = new OpenAI(
        { apiKey: process.env.OPENAI_API_KEY }
    );

    try {
        let combinedPrompt: string = "";

        // ChatGPT only accepts strings, therefore userPrompt has to be converted if it is an array
        if (!Array.isArray(userPrompt)) {
            combinedPrompt = userPrompt;
        } else {
            for (let x = 0; x < userPrompt.length; x++) {
                combinedPrompt += userPrompt[x];
            }
        }
        const message = await chatgpt.responses.create({
            model: model.modelName,
            input: combinedPrompt,
            instructions: systemPrompt,
        });

        writeToLog(logFilename, "ChatGPT Request", message);
        if (!message.output_text) {
            return { ok: false, error: 'Empty response from ChatGPT' };
        }
        return { ok: true, response: message.output_text };
    } catch (error) {
        console.error('Error querying ChatGPT:', error);
        return { ok: false, error: (error as Error).message || 'unknown-error' };
    }
}

async function queryCortecs(model: LLM, systemPrompt: string, userPrompt: string, logFilename: string = logFilenames.misc): Promise<LLMQueryResult> {
    const cortecs = new OpenAI(
        {
            apiKey: process.env.CORTECS_API_KEY,
            baseURL: 'https://api.cortecs.ai/v1',
        }
    );
    try {
        const completion = await cortecs.chat.completions.create({
            model: model.modelName,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: model.temperature,
        });

        writeToLog(logFilename, "Cortecs Request with model " + model.modelName, completion);
        const content = completion.choices[0].message.content;
        if (!content) {
            return { ok: false, error: 'Empty response from Cortecs' };
        }
        return { ok: true, response: content };
    } catch (error) {
        console.error('Error querying Cortecs with model ' + model.modelName + ':', error);
        return { ok: false, error: (error as Error).message || 'unknown-error' };
    }
}