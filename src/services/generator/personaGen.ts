import { LLM } from "../../data/types";
import { queryOpenRouter } from "../llm/openRouter";
import { personaSystemPrompt } from "../../data/prompts";
import { parseLLMOutput } from "../utils";
import { queryGemini } from "../llm/gemini";
import { queryAzure } from "../llm/azure";
import { logFilenames } from "../../data/staticContent";

/**
 * Generates a knowledge graph using persona prompting by querying the specified Large Language Model (LLM) endpoint.
 *
 * Selects the appropriate system prompt based on the `shot` parameter and sends a request to the
 * corresponding LLM service (OpenRouter, Gemini, or Azure). The response is parsed and returned as a string.
 *
 * @param llm - The LLM configuration object specifying the endpoint and model ID.
 * @param shot - Determines which system prompt to use (0 for zero-shot, otherwise one-shot).
 * @param activityText - The activity description or context to provide to the LLM.
 * @param logFilename - (Optional) The filename to use for logging the request and response. Defaults to a miscellaneous log file.
 * @returns A promise that resolves to the generated TTL.
 * @throws Will reject the promise if the LLM endpoint is unsupported.
 */
export async function requestPersonaGen(llm: LLM, shot: string, activityText: string, logFilename: string = logFilenames.misc): Promise<string> {
    let res: string;
    let systemPrompt = personaSystemPrompt[shot as keyof typeof personaSystemPrompt];
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
