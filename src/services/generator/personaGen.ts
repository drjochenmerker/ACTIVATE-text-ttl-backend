import { LLM } from "../../data/types";
import { queryOpenRouter } from "../llm/openRouter";
import { personaSystemPrompt } from "../../data/prompts";

export async function requestPersonaGen(llm: LLM, activityText: string): Promise<string> {
    let res: string;
    switch (llm.endpoint) {
        case 'openRouter':
            res = await queryOpenRouter(llm.id, personaSystemPrompt, activityText)
            break;
        default:
            return Promise.reject(new Error("Unsupported LLM endpoint"));
    }
    return res;
}
