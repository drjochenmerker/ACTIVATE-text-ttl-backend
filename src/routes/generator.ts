// src/routes/generator.ts
import { Router } from 'express';
import { supportedLLMs } from '../data/resources.js';
import { requestPersonaGen } from '../services/generator/personaGen.js';
import { errorMessages, logFilenames, progressMessages } from '../data/staticContent.js';
import { parseLLMOutput, writeToLog } from '../services/utils.js';
import { validate } from '../services/validator.js';
import { baseSystemPrompt, iterativeSystemPrompts, personaSystemPrompt, ttlEditPrompt, ttlSyntaxFixPrompt } from '../data/prompts.js';
import { queryGemini } from '../services/llm/gemini.js';
import { requestKgGen } from '../services/generator/baseGen.js';
import { getIO } from '../socket.js';

const router = Router();

/**
 * @swagger
 * /api/generator/debug:
 *   post:
 *     summary: Returns a static TTL example for debugging purposes.
 *     tags:
 *       - Generator
 *     responses:
 *       200:
 *         description: Static TTL example returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: done
 *                 ttl:
 *                   type: string
 *                   example: |
 *                     @prefix : <http://example.org/> .
 *                     @prefix ex: <http://example.org/> .
 *                     
 *                     ex:doctor a ex:Doctor.
 *                     ex:doctor ex:hasName ex:Doctor.
 *                     ex:patient a ex:Patient.
 *                     ex:doctor ex:treated ex:patient.
 *                     ex:patient ex:asks ex:doctor.
 */
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

/**
 * @swagger
 * /api/generator/start:
 *   post:
 *     summary: Starts the TTL generator process.
 *     tags:
 *       - Generator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               generatorId:
 *                 type: string
 *                 example: persona-generator#0
 *               llmId:
 *                 type: string
 *                 example: gemini-2.5-flash-preview-05-20
 *               activityText:
 *                 type: string
 *                 example: "A doctor treats a patient."
 *     responses:
 *       200:
 *         description: TTL generated successfully or error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: done
 *                 ttl:
 *                   type: string
 *                   example: |
 *                     @prefix : <http://example.org/> .
 *                     @prefix ex: <http://example.org/> .
 *                     
 *                     ex:doctor a ex:Doctor.
 *                     ex:doctor ex:hasName ex:Doctor.
 *                     ex:patient a ex:Patient.
 *                     ex:doctor ex:treated ex:patient.
 *                     ex:patient ex:asks ex:doctor.
 *                 error:
 *                   type: string
 *                   example: "Missing required fields."
 */
router.post('/start', async (req, res) => {
    writeToLog(logFilenames.start, "Generator Start Request", JSON.stringify(req.body));
    const generatorId = req.body.generatorId;
    const llmId = req.body.llmId;
    const activityText = req.body.activityText;
    // Send updates to client if possible
    const io = getIO();
    // Check if request has all quired fields
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
        let systemPrompt: string = '';
        switch ((generatorId as string).split('#')[0]) {
            case 'persona-generator':
                writeToLog(logFilenames.start, "Starting " + generatorId + " Generator with LLM: " + llm.id, '');
                io.emit('generator-progress', { progress: 1 / 2, message: progressMessages.start });
                systemPrompt = personaSystemPrompt[generatorId.split('#')[1] as keyof typeof personaSystemPrompt];
                generatedTTL = await requestKgGen(llm, systemPrompt, activityText, logFilenames.start);
                break;
            case 'base-generator':
                writeToLog(logFilenames.start, "Starting Base Generator with LLM: " + llm.id, '');
                io.emit('generator-progress', { progress: 1 / 2, message: progressMessages.start });
                systemPrompt = baseSystemPrompt[generatorId.split('#')[1] as keyof typeof baseSystemPrompt];
                generatedTTL = await requestKgGen(llm, systemPrompt, activityText, logFilenames.start);
                break;
            case 'iterative-generator':
                const shot = generatorId.split('#')[1] as keyof typeof iterativeSystemPrompts;
                let generatedTTLObject = {
                    setting: '',
                    entities: '',
                    conflicts: '',
                }
                let result: string;
                writeToLog(logFilenames.start, "Starting Iterative Generator with LLM: " + llm.id, '');
                io.emit('generator-progress', { progress: 1 / 7, message: progressMessages.iterative.setting });
                result = await requestKgGen(llm, iterativeSystemPrompts[shot][0], activityText, logFilenames.start);
                if (result === 'error' || result.length === 0) {
                    res.status(200).json({
                        error: errorMessages.generationFailed,
                    });
                    return;
                }
                generatedTTLObject.setting = result;
                writeToLog(logFilenames.start, "Setting Generated: " + generatedTTLObject.setting, '');

                io.emit('generator-progress', { progress: 2 / 7, message: progressMessages.iterative.entity });
                result = await requestKgGen(llm, iterativeSystemPrompts[shot][1], activityText, logFilenames.start);
                if (result === 'error' || result.length === 0) {
                    res.status(200).json({
                        error: errorMessages.generationFailed,
                    });
                    return;
                }
                generatedTTLObject.entities = result
                writeToLog(logFilenames.start, "Entities Generated: " + generatedTTLObject.entities, '');

                io.emit('generator-progress', { progress: 3 / 7, message: progressMessages.iterative.properties });
                result = await requestKgGen(llm, iterativeSystemPrompts[shot][2], `Text: ${activityText}\nEntities: ${generatedTTLObject.entities}`, logFilenames.start);
                if (result === 'error' || result.length === 0) {
                    res.status(200).json({
                        error: errorMessages.generationFailed,
                    });
                    return;
                }
                generatedTTLObject.entities = result
                writeToLog(logFilenames.start, "Properties Generated: " + generatedTTLObject.entities, '');

                io.emit('generator-progress', { progress: 4 / 7, message: progressMessages.iterative.relations });
                result = await requestKgGen(llm, iterativeSystemPrompts[shot][3], `Text: ${activityText}\nEntities: ${generatedTTLObject.entities}`, logFilenames.start);
                if (result === 'error' || result.length === 0) {
                    res.status(200).json({
                        error: errorMessages.generationFailed,
                    });
                    return;
                }
                generatedTTLObject.entities = result
                writeToLog(logFilenames.start, "Relations Generated: " + generatedTTLObject.entities, '');

                io.emit('generator-progress', { progress: 5 / 7, message: progressMessages.iterative.tensions });
                result = await requestKgGen(llm, iterativeSystemPrompts[shot][4], `Text: ${activityText}\Data: ${generatedTTLObject.entities}`, logFilenames.start);
                if (result === 'error' || result.length === 0) {
                    res.status(200).json({
                        error: errorMessages.generationFailed,
                    });
                    return;
                }
                generatedTTLObject.conflicts = result
                writeToLog(logFilenames.start, "Conflicts Generated: " + generatedTTLObject.conflicts, '');

                io.emit('generator-progress', { progress: 6 / 7, message: progressMessages.iterative.merging });
                result = await requestKgGen(llm, iterativeSystemPrompts[shot][5], `Setting: ${generatedTTLObject.setting}\nEntities: ${generatedTTLObject.entities}\nConflicts: ${generatedTTLObject.conflicts}`, logFilenames.start);
                if (result === 'error' || result.length === 0) {
                    res.status(200).json({
                        error: errorMessages.generationFailed,
                    });
                    return;
                }
                generatedTTL = result
                writeToLog(logFilenames.start, "Merged TTL Generated: " + generatedTTL, '');
                break;
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
                io.emit('generator-progress', { progress: 90, message: progressMessages.validate });
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

/**
 * @swagger
 * /api/generator/edit:
 *   post:
 *     summary: Edits an existing TTL using LLM instructions.
 *     tags:
 *       - Generator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               llmId:
 *                 type: string
 *                 example: gemini-2.5-flash-preview-05-20
 *               inputTTL:
 *                 type: string
 *                 example: |
 *                   @prefix : <http://example.org/> .
 *                   ex:doctor a ex:Doctor.
 *               userInstructions:
 *                 type: string
 *                 example: "Change the doctor's name to Dr. Smith."
 *     responses:
 *       200:
 *         description: TTL edited successfully or error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: done
 *                 ttl:
 *                   type: string
 *                   example: |
 *                     @prefix : <http://example.org/> .
 *                     ex:doctor a ex:Doctor.
 *                 error:
 *                   type: string
 *                   example: "Missing required fields."
 */
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
