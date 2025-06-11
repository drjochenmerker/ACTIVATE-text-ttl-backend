import { LLM } from "../../data/types";
import { queryOpenRouter } from "../llm/openRouter";
import { personaSystemPrompt } from "../../data/prompts";
import { parseLLMOutput } from "../utils";
import { queryGemini } from "../llm/gemini";
import { queryAzure } from "../llm/azure";

export async function requestPersonaGen(llm: LLM, activityText: string): Promise<string> {
    let res: string;
    switch (llm.endpoint) {
        case 'openRouter':
            res = parseLLMOutput(await queryOpenRouter(llm.id, personaSystemPrompt, activityText))
            break;
        case 'gemini':
            res = parseLLMOutput(await queryGemini(llm.id, personaSystemPrompt, activityText));
            break;
        case 'azure':
            res = parseLLMOutput(await queryAzure(personaSystemPrompt, activityText));
            break;
        default:
            return Promise.reject(new Error("Unsupported LLM endpoint"));
    }
    return res;
}
