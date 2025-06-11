// src/routes/generator.ts
import { Router } from 'express';
import { getIO } from '../socket';
import { supportedLLMs } from '../data/resources';
import { requestPersonaGen } from '../services/generator/personaGen';
import { errorMessages } from '../data/staticContent';
import { clearLog, parseLLMOutput, writeToLog } from '../services/utils';
import { validate } from '../services/validator';
import { queryOpenRouter } from '../services/llm/openRouter';
import { ttlSyntaxFixPrompt } from '../data/prompts';
import { write } from 'fs';

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
    clearLog();
    const generatorId = req.body.generatorId;
    const llmId = req.body.llmId;
    const activityText = req.body.activityText;
    const io = getIO();
    io.emit('generator-progress', 50);
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
        switch (generatorId) {
            case 'persona-generator':
                writeToLog("Starting Persona Generator with LLM: " + llm.id, '');
                generatedTTL = await requestPersonaGen(llm, activityText);
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
        llm.id = 'qwen/qwen3-235b-a22b:free';
        do {
            validateCount++;
            if (validateCount > 5) {
                res.status(200).json({
                    error: errorMessages.validationFailed,
                });
                return;
            }
            let validatorResult = await validate(generatedTTL);
            writeToLog("Validator Call #" + validateCount, validatorResult)
            if (validatorResult.errors.length > 0) {
                generatedTTL = parseLLMOutput(await queryOpenRouter(llm.id, ttlSyntaxFixPrompt, generatedTTL + '\n' + JSON.stringify(validatorResult.errors)));
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

export default router;
