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
    // TODO: Decide what to do with systemprompt and activitytext
    let llmOutput: string = "";
    switch (llm.name) {
        case 'gemini':
            llmOutput = await queryGemini(llm, systemPrompt, activityText, logFilename);
            break;
        case 'chatgpt':
            llmOutput = await queryChatGPT(llm, activityText, logFilename);
            break;
        case 'claude':
            llmOutput = await queryClaude(llm, activityText, logFilename);
            break;
        default:
            break;
    }
    
    return parseLLMOutput(llmOutput);
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
async function queryGemini(model: LLM, systemPrompt: string, userPrompt: string, logFilename: string = logFilenames.misc): Promise<string> {
    const gemini = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    try {
        const response = await gemini.models.generateContent({
            model: model.id,
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                temperature: model.temperature
            }
        });
        writeToLog(logFilename, "Gemini Request", response)
        return response.text || 'error'
    } catch (error) {
        console.error('Error querying Gemini:', error);
        return "error"
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
async function queryClaude(model: LLM, userPrompt: string, logFilename: string = logFilenames.misc): Promise<string> {
    const claude = new Anthropic({
        apiKey: process.env['ANTHROPIC_API_KEY'],
      });
    
    try {
        const message = await claude.messages.create({
            max_tokens: 1024,
            messages: [{ role: 'user', content: userPrompt }],
            model: model.id,
            temperature: model.temperature,
        });

        writeToLog(logFilename, "Claude Request", message)
        return (message.content[0] as Anthropic.TextBlock).text || 'error'; // Type cast to avoid type errors
    } catch (error) {
        console.error('Error querying Claude:', error);
        return "error"
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
async function queryChatGPT(model: LLM, userPrompt: string, logFilename: string = logFilenames.misc): Promise<string> {

    const chatgpt = new OpenAI(
        {apiKey: process.env['OPENAI_API_KEY']}
    );

    try {
        const message = await chatgpt.responses.create({
            input: userPrompt,
            model: model.id,
            temperature : model.temperature
        });

        writeToLog(logFilename, "ChatGPT Request", message);
        return message.output_text || 'error';
    } catch (error) {
        console.error('Error querying ChatGPT:', error);
        return "error"
    }
}