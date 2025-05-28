import { GeneratorPipeline, LLM } from './types';

export const supportedLLMs: LLM[] = [
    {
        id: 'gemini-2.5-pro-preview-05-06',
        name: 'Gemini 2.5 Pro Preview',
        endpoint: 'gemini',
        description: {
            de: 'Gemini 2.5 Pro ist eine verbesserte Version des Gemini-Modells, die für professionelle Anwendungen optimiert wurde.',
            en: 'Gemini 2.5 Pro is an enhanced version of the Gemini model, optimized for professional applications.',
            sv: 'Gemini 2.5 Pro är en förbättrad version av Gemini-modellen, optimerad för professionella applikationer.'
        }
    },
    {
        id: 'gemini-2.5-flash-preview-05-20',
        name: 'Gemini 2.5 Flash Preview',
        endpoint: 'gemini',
        description: {
            de: 'Gemini 2.5 Flash ist eine schnellere Version des Gemini-Modells, optimiert für Echtzeitanwendungen.',
            en: 'Gemini 2.5 Flash is a faster version of the Gemini model, optimized for real-time applications.',
            sv: 'Gemini 2.5 Flash är en snabbare version av Gemini-modellen, optimerad för realtidsapplikationer.'
        }
    },
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        endpoint: 'gemini',
        description: {
            de: 'Gemini 2.0 Flash ist eine schnelle Version des Gemini-Modells, die für Echtzeitanwendungen entwickelt wurde.',
            en: 'Gemini 2.0 Flash is a fast version of the Gemini model designed for real-time applications.',
            sv: 'Gemini 2.0 Flash är en snabb version av Gemini-modellen, designad för realtidsapplikationer.'
        }
    },
    {
        id: 'gemma-3-27b-it',
        name: 'Gemma 3',
        endpoint: 'gemini',
        description: {
            de: 'Gemma 3 27B ist ein leistungsstarkes Sprachmodell, das für komplexe Textverarbeitungsaufgaben entwickelt wurde.',
            en: 'Gemma 3 27B is a powerful language model designed for complex text processing tasks.',
            sv: 'Gemma 3 27B är en kraftfull språkmodell designad för komplexa textbehandlingsuppgifter.'
        }
    },
    {
        id: 'model-router',
        name: 'Azure Model Router',
        endpoint: 'azure',
        description: {
            de: 'Azure Model Router ist ein intelligenter LLM-Router, der Anfragen an das am besten geeignete OpenAI-Modell weiterleitet.',
            en: 'Azure Model Router is an intelligent LLM router that directs requests to the most suitable OpenAI model.',
            sv: 'Azure Model Router är en intelligent LLM-router som dirigerar förfrågningar till den mest lämpliga OpenAI-modellen.'
        }
    },
    {
        id: 'deepseek/deepseek-chat-v3-0324:free',
        name: 'DeepSeek V3',
        endpoint: 'openRouter',
        description: {
            de: 'DeepSeek V3, ein 685B-Parameter-Mischmodell, ist die neueste Iteration der Flaggschiff-Chat-Modellfamilie des DeepSeek-Teams. Es folgt dem DeepSeek V3-Modell und erzielt bei einer Vielzahl von Aufgaben sehr gute Ergebnisse.',
            en: 'DeepSeek V3, a 685B-parameter, mixture-of-experts model, is the latest iteration of the flagship chat model family from the DeepSeek team. It succeeds the DeepSeek V3 model and performs really well on a variety of tasks.',
            sv: 'DeepSeek V3, en 685B-parameter blandning av experter modell, är den senaste iterationen av flaggskepps chattmodell familjen från DeepSeek-teamet. Den efterträder DeepSeek V3-modellen och presterar mycket bra på en mängd olika uppgifter.'
        }
    },
    {
        id: 'qwen/qwen3-235b-a22b:free',
        name: 'Qwen3',
        endpoint: 'openRouter',
        description: {
            de: 'Qwen3-235B-A22B ist ein 235B-Parameter-Mischmodell (MoE), das von Qwen entwickelt wurde und 22B Parameter pro Vorwärtsdurchlauf aktiviert. Es unterstützt nahtloses Umschalten zwischen einem "Denkmodus" für komplexe Schlussfolgerungen, Mathematik- und Programmieraufgaben und einem "Nicht-Denkmodus" für allgemeine Konversations-Effizienz. Das Modell zeigt starke Schlussfolgerungsfähigkeiten, mehrsprachige Unterstützung (über 100 Sprachen und Dialekte), fortgeschrittenes Befolgen von Anweisungen und Agenten-Tool-Aufruf-Fähigkeiten. Es verarbeitet nativ ein Kontextfenster von 32K Token und erweitert sich auf bis zu 131K Token mit YaRN-basierter Skalierung.',
            en: 'Qwen3-235B-A22B is a 235B parameter mixture-of-experts (MoE) model developed by Qwen, activating 22B parameters per forward pass. It supports seamless switching between a "thinking" mode for complex reasoning, math, and code tasks, and a "non-thinking" mode for general conversational efficiency. The model demonstrates strong reasoning ability, multilingual support (100+ languages and dialects), advanced instruction-following, and agent tool-calling capabilities. It natively handles a 32K token context window and extends up to 131K tokens using YaRN-based scaling.',
            sv: 'Qwen3-235B-A22B är en 235B parameter blandning av experter (MoE) modell utvecklad av Qwen, som aktiverar 22B parametrar per framåtpass. Den stöder sömlöst växling mellan ett "tänkande" läge för komplexa resonemang, matematik och koduppgifter, och ett "icke-tänkande" läge för allmän konversations effektivitet. Modellen visar starka resonemangsförmågor, flerspråkigt stöd (över 100 språk och dialekter), avancerad instruktion följning och agent verktyg anropsförmåga. Den hanterar nativt ett 32K token kontextfönster och utökas upp till 131K tokens med YaRN-baserad skalning.'
        }
    },
    {
        id: 'mistralai/devstral-small:free',
        name: 'DevStral Small',
        endpoint: 'openRouter',
        description: {
            de: 'Devstral-Small-2505 ist ein 24B-Parameter-agentisches LLM, das von Mistral-Small-3.1 feinjustiert wurde und gemeinsam von Mistral AI und All Hands AI für fortgeschrittene Software-Engineering-Aufgaben entwickelt wurde. Es ist optimiert für die Erkundung von Codebasen, die Bearbeitung mehrerer Dateien und die Integration in Codierungsagenten und erzielt erstklassige Ergebnisse auf SWE-Bench Verified (46,8%).',
            en: 'Devstral-Small-2505 is a 24B parameter agentic LLM fine-tuned from Mistral-Small-3.1, jointly developed by Mistral AI and All Hands AI for advanced software engineering tasks. It is optimized for codebase exploration, multi-file editing, and integration into coding agents, achieving state-of-the-art results on SWE-Bench Verified (46.8%).',
            sv: 'Devstral-Small-2505 är en 24B parameter agentisk LLM finjusterad från Mistral-Small-3.1, gemensamt utvecklad av Mistral AI och All Hands AI för avancerade mjukvaruutvecklingsuppgifter. Den är optimerad för kodbasutforskning, redigering av flera filer och integration i kodningsagenter, och uppnår toppresultat på SWE-Bench Verified (46,8%).'
        }
    },
    {
        id: 'meta-llama/llama-4-maverick:free',
        name: 'Llama 4 Maverick',
        endpoint: 'openRouter',
        description: {
            de: 'Llama 4 Maverick 17B Instruct (128E) ist ein hochkapazitives multimodales Sprachmodell von Meta, das auf einer Mischung von Experten (MoE)-Architektur mit 128 Experten und 17 Milliarden aktiven Parametern pro Vorwärtsdurchlauf (insgesamt 400B) basiert. Es unterstützt mehrsprachige Text- und Bildeingaben und erzeugt mehrsprachige Text- und Codeausgaben in 12 unterstützten Sprachen. Optimiert für vision-sprachliche Aufgaben ist Maverick anweisungsoptimiert für assistentähnliches Verhalten, Bildschlussfolgerung und allgemeine multimodale Interaktion.',
            en: 'Llama 4 Maverick 17B Instruct (128E) is a high-capacity multimodal language model from Meta, built on a mixture-of-experts (MoE) architecture with 128 experts and 17 billion active parameters per forward pass (400B total). It supports multilingual text and image input, and produces multilingual text and code output across 12 supported languages. Optimized for vision-language tasks, Maverick is instruction-tuned for assistant-like behavior, image reasoning, and general-purpose multimodal interaction.',
            sv: 'Llama 4 Maverick 17B Instruct (128E) är en högkapacitets multimodal språkmodell från Meta, byggd på en blandning av experter (MoE) arkitektur med 128 experter och 17 miljarder aktiva parametrar per framåtpass (totalt 400B). Den stöder flerspråkig text- och bildeingång, och producerar flerspråkig text- och kodutgång över 12 stödda språk. Optimerad för vision-språk uppgifter, är Maverick anvisningsoptimerad för assistentliknande beteende, bildresonemang och allmän multimodal interaktion.'
        }

    },
    {
        id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
        name: 'Llama 3.1 Nemotron Ultra',
        endpoint: 'openRouter',
        description: {
            de: 'Llama-3.1-Nemotron-Ultra-253B-v1 ist ein großes Sprachmodell (LLM), das für fortgeschrittenes Schlussfolgern, interaktive Chats mit Menschen, retrieval-unterstützte Generierung (RAG) und Tool-Aufruf-Aufgaben optimiert ist. Abgeleitet von Meta’s Llama-3.1-405B-Instruct wurde es erheblich mit Neural Architecture Search (NAS) angepasst, was zu verbesserter Effizienz, reduziertem Speicherverbrauch und verbesserter Inferenzlatenz führt. Das Modell unterstützt eine Kontextlänge von bis zu 128K Tokens und kann effizient auf einem 8x NVIDIA H100-Knoten betrieben werden.',
            en: 'Llama-3.1-Nemotron-Ultra-253B-v1 is a large language model (LLM) optimized for advanced reasoning, human-interactive chat, retrieval-augmented generation (RAG), and tool-calling tasks. Derived from Meta’s Llama-3.1-405B-Instruct, it has been significantly customized using Neural Architecture Search (NAS), resulting in enhanced efficiency, reduced memory usage, and improved inference latency. The model supports a context length of up to 128K tokens and can operate efficiently on an 8x NVIDIA H100 node.',
            sv: 'Llama-3.1-Nemotron-Ultra-253B-v1 är en stor språkmodell (LLM) optimerad för avancerat resonemang, mänskligt interaktivt chatt, retrieval-förstärkt generering (RAG) och verktygsanropsuppgifter. Härledd från Meta’s Llama-3.1-405B-Instruct har den anpassats avsevärt med Neural Architecture Search (NAS), vilket resulterar i förbättrad effektivitet, minskat minnesanvändning och förbättrad inferenslatens. Modellen stöder en kontextlängd på upp till 128K tokens och kan fungera effektivt på en 8x NVIDIA H100-nod.'
        }
    },
    {
        id: 'microsoft/phi-4-reasoning-plus:free',
        name: 'Phi-4 Reasoning Plus',
        endpoint: 'openRouter',
        description: {
            en: 'Phi-4-reasoning-plus is an enhanced 14B parameter model from Microsoft, fine-tuned from Phi-4 with additional reinforcement learning to boost accuracy on math, science, and code reasoning tasks. It uses the same dense decoder-only transformer architecture as Phi-4, but generates longer, more comprehensive outputs structured into a step-by-step reasoning trace and final answer.',
            de: 'Phi-4-reasoning-plus ist ein verbessertes 14B-Parameter-Modell von Microsoft, das aus Phi-4 mit zusätzlichem Reinforcement Learning zur Steigerung der Genauigkeit bei Mathematik-, Wissenschafts- und Programmieraufgaben feinjustiert wurde. Es verwendet dieselbe dichte Decoder-Only-Transformer-Architektur wie Phi-4, erzeugt jedoch längere, umfassendere Ausgaben, die in eine schrittweise Argumentationsverfolgung und eine endgültige Antwort strukturiert sind.',
            sv: 'Phi-4-reasoning-plus är en förbättrad 14B parameter modell från Microsoft, finjusterad från Phi-4 med ytterligare förstärkningsinlärning för att öka noggrannheten vid matematik-, vetenskap- och kodresonemangsuppgifter. Den använder samma täta decoder-only transformerarkitektur som Phi-4'
        }
    }
]

export const implementedGenerators: GeneratorPipeline[] = [
    {
        id: 'persona-generator',
        name: {
            de: 'Persona Generator',
            en: 'Persona Generator',
            sv: 'Persona Generator'
        },
        description: {
            de: 'Der Persona Generator, welcher den Knowledge Graph auf Basis von Personas generiert. Dem LLM wird die Rolle eines Experten zugewiesen, um die Ergebnisse zu verbessern.',
            en: 'The Persona Generator, which generates the knowledge graph based on personas. The LLM is assigned the role of an expert to improve the results.',
            sv: 'Persona Generator, som genererar kunskapsgrafen baserat på personas. LLM tilldelas rollen som expert för att förbättra resultaten.'
        },
    },
    {
        id: 'iterative-generator',
        name: {
            de: 'Iterativer Generator',
            en: 'Iterative Generator',
            sv: 'Iterativ Generator'
        },
        description: {
            de: 'Der Iterative Generator, welcher den Knowledge Graph iterativ über mehrere Anfragen an das LLM aufbaut.',
            en: 'The Iterative Generator, which builds the knowledge graph iteratively through multiple requests to the LLM.',
            sv: 'Den Iterativa Generatorn, som bygger kunskapsgrafen iterativ genom flera förfrågningar till LLM.'
        },
    }
]