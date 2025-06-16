// src/routes/generator.ts
import { Router } from 'express';
import { supportedLLMs } from '../data/resources.js';
import { requestPersonaGen } from '../services/generator/personaGen.js';
import { errorMessages, logFilenames } from '../data/staticContent.js';
import { parseLLMOutput, writeToLog } from '../services/utils.js';
import { validate } from '../services/validator.js';
import { ttlEditPrompt, ttlSyntaxFixPrompt } from '../data/prompts.js';
import { queryGemini } from '../services/llm/gemini.js';

const router = Router();

router.post('/debug', (req, res) => {
    res.json({
        status: 'done',
        ttl: `@prefix : <http://example.org/> .
@prefix ex: <http://example.org/> .

ex:doctor a ex:Doctor.
ex:doctor ex:hasName ex:Doctor.
ex:patient a ex:Patient.
ex:doctor ex:treated ex:patient.
ex:patient ex:asks ex:doctor.`
    })
})

router.post('/start', async (req, res) => {
    writeToLog(logFilenames.start, "Generator Start Request", JSON.stringify(req.body));
    const generatorId = req.body.generatorId;
    const llmId = req.body.llmId;
    const activityText = req.body.activityText;
    // const io = getIO();
    // io.emit('generator-progress', 50);
    // Validate Request Body
    if (!generatorId || !llmId || !activityText) {
        res.status(200).json({
            error: errorMessages.missingFields,
        });
        return;
    }
    // Get and validate llm provider
    const llm = supportedLLMs.find((llm) => llm.id === llmId);
    if (!llm || !['openRouter', 'gemini', 'azure'].includes(llm.endpoint)) {
        res.status(200).json({
            error: errorMessages.unsupportedLLM,
        });
    } else {
        // Start generator process and send progress updates
        let generatedTTL: string = '';
        switch ((generatorId as string).split('#')[0]) {
            case 'persona-generator':
                writeToLog(logFilenames.start, "Starting Persona Generator with LLM: " + llm.id, '');
                generatedTTL = await requestPersonaGen(llm, generatorId.split('#')[1], activityText, logFilenames.start);
                break;
            // case 'iterative-generator':
            //     break;
            default:
                res.status(200).json({
                    error: errorMessages.unsupportedGenerator,
                });
                return;
        }
        // Check for failed generation
        if (generatedTTL === 'error' || generatedTTL.length === 0) {
            res.status(200).json({
                error: errorMessages.generationFailed,
            });
            return;
        }
        // Validate generated TTL
        let validateCount = 0;
        let validated = false;
        // Set validator model to free openrouter model to save cost
        // const validatorLLM = 'qwen/qwen3-235b-a22b:free';
        // const validatorLLM = 'google/gemini-2.0-flash-exp:free'
        const validatorLLM = 'gemini-2.5-flash-preview-05-20'
        do {
            validateCount++;
            if (validateCount > 5) {
                res.status(200).json({
                    error: errorMessages.validationFailed,
                });
                return;
            }
            let validatorResult = await validate(generatedTTL);
            writeToLog(logFilenames.start, "Validator Call #" + validateCount, validatorResult)
            if (validatorResult.errors.length > 0) {
                // generatedTTL = parseLLMOutput(await queryOpenRouter(validatorLLM, ttlSyntaxFixPrompt, generatedTTL + '\n' + JSON.stringify(validatorResult.errors), logFilenames.start));
                generatedTTL = parseLLMOutput(await queryGemini(validatorLLM, ttlSyntaxFixPrompt, generatedTTL + '\n' + JSON.stringify(validatorResult.errors), logFilenames.start));
            } else {
                validated = true;
            }
        } while (!validated)
        // Return generated TTL
        res.json({
            status: 'done', ttl: generatedTTL
        });
    }
});

router.post('/edit', async (req, res) => {
    writeToLog(logFilenames.edit, "Generator Edit Request", JSON.stringify(req.body));
    let llmId = req.body.llmId;
    const inputTTL = req.body.inputTTL;
    const userInstructions = req.body.userInstructions;
    // Validate Request Body
    if (!llmId || !inputTTL || !userInstructions) {
        res.status(200).json({
            error: errorMessages.missingFields,
        });
        return;
    }
    // Set edit model to free openrouter model to save cost
    // llmId = 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free';
    // llmId = 'google/gemini-2.0-flash-exp:free'
    llmId = 'gemini-2.5-flash-preview-05-20'
    // Start generator process and send progress updates
    let generatedTTL: string = '';
    // generatedTTL = parseLLMOutput(await queryOpenRouter(llmId, ttlEditPrompt, "TTL: " + inputTTL + '\n' + "Instructions: " + userInstructions, logFilenames.edit));
    generatedTTL = parseLLMOutput(await queryGemini(llmId, ttlEditPrompt, "TTL: " + inputTTL + '\n' + "Instructions: " + userInstructions, logFilenames.edit));
    // Check for failed generation
    if (generatedTTL === 'error' || generatedTTL.length === 0) {
        res.status(200).json({
            error: errorMessages.generationFailed,
        });
        return;
    }
    // Validate generated TTL
    let validateCount = 0;
    let validated = false;
    do {
        validateCount++;
        if (validateCount > 5) {
            res.status(200).json({
                error: errorMessages.validationFailed,
            });
            return;
        }
        let validatorResult = await validate(generatedTTL);
        writeToLog(logFilenames.edit, "Validator Call #" + validateCount, validatorResult)
        if (validatorResult.errors.length > 0) {
            // generatedTTL = parseLLMOutput(await queryOpenRouter(llmId, ttlSyntaxFixPrompt, generatedTTL + '\n' + JSON.stringify(validatorResult.errors), logFilenames.edit));
            generatedTTL = parseLLMOutput(await queryGemini(llmId, ttlSyntaxFixPrompt, generatedTTL + '\n' + JSON.stringify(validatorResult.errors), logFilenames.edit));

        } else {
            validated = true;
        }
    } while (!validated)
    // Return generated TTL
    res.json({
        status: 'done', ttl: generatedTTL
    });
})

export default router;
