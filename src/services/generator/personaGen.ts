import { LLM } from "../../data/types";
import { queryOpenRouter } from "../llm/openRouter";
import { personaSystemPrompt } from "../../data/prompts";
import { parseLLMOutput } from "../utils";
import { queryGemini } from "../llm/gemini";
import { queryAzure } from "../llm/azure";
import { logFilenames } from "../../data/staticContent";

export async function requestPersonaGen(llm: LLM, shot: number, activityText: string, logFilename: string = logFilenames.misc): Promise<string> {
    let res: string;
    let systemPrompt = shot == 0 ? personaSystemPrompt.zero : personaSystemPrompt.one;
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
