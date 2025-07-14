// src/routes/feedback.ts
import { Router } from 'express';
import { supportedLLMs } from '../data/resources.js';
import { errorMessages, logFilenames, progressMessages } from '../data/staticContent.js';
import { parseLLMOutput, requestKgGen, writeToLog } from '../services/utils.js';
import { validate } from '../services/validator.js';
import { baseSystemPrompt, feedbackSystemPrompts, iterativeSystemPrompts, personaSystemPrompt, ttlEditPrompt, ttlSyntaxFixPrompt } from '../data/prompts.js';
import { queryGemini } from '../services/llm/gemini.js';
import { getIO } from '../socket.js';

const router = Router();

/**
 * @swagger
 * /api/feedback/submit:
 *   post:
 *     summary: Submit feedback to TTL generation pipeline
 *     description: |
 *       Accepts user feedback and generates TTL (Turtle) data using an LLM. Validates and fixes the generated TTL if necessary.
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - setting
 *               - role
 *               - feedback
 *             properties:
 *               setting:
 *                 type: string
 *                 description: The feedback setting/context.
 *               role:
 *                 type: string
 *                 description: The feedback role/persona.
 *               feedback:
 *                 type: string
 *                 description: The feedback text.
 *           example:
 *             setting: "classroom"
 *             role: "teacher"
 *             feedback: "The lesson was engaging and students participated actively."
 *     responses:
 *       200:
 *         description: Generation result or error message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the operation (e.g., 'done').
 *                 ttl:
 *                   type: string
 *                   description: Generated TTL data.
 *                 error:
 *                   type: string
 *                   description: Error message if generation or validation failed.
 */
router.post('/submit', async (req, res) => {
    writeToLog(logFilenames.feedback, "Trying to parse feedback: ", JSON.stringify(req.body));
    const feedbackSetting = req.body.setting;
    const feedbackRole = req.body.role;
    const feedback = req.body.feedback;
    const llm = supportedLLMs.find((llm) => llm.id === 'gemini-2.5-flash');
    // Check if request has all required fields
    if (!feedbackSetting || !feedbackRole || !feedback || !llm) {
        res.status(200).json({
            error: errorMessages.missingFields,
        });
        return;
    }
    // Parse feedback and and to pooling layer for later processing
    let generatedTTL: string = '';
    let systemPrompt: string = '';
    let generatedTTLObject = {
        entities: '',
        conflicts: '',
    }
    let result: string;
    writeToLog(logFilenames.start, "Starting Iterative Generator with LLM", '');
    result = await requestKgGen(llm, feedbackSystemPrompts[0], `
            Setting: ${feedbackSetting}
            Feedback: ${feedback}
        `, logFilenames.feedback);

    // result = await requestKgGen(llm, iterativeSystemPrompts[shot][1], activityText, logFilenames.start);
    // if (result === 'error' || result.length === 0) {
    //     res.status(200).json({
    //         error: errorMessages.generationFailed,
    //     });
    //     return;
    // }
    // generatedTTLObject.entities = result
    // // writeToLog(logFilenames.start, "Entities Generated: " + generatedTTLObject.entities, '');

    // io.emit('generator-progress', { progress: 3 / 7, message: progressMessages.iterative.properties });
    // result = await requestKgGen(llm, iterativeSystemPrompts[shot][2], `Text: ${activityText}\nEntities: ${generatedTTLObject.entities}`, logFilenames.start);
    // if (result === 'error' || result.length === 0) {
    //     res.status(200).json({
    //         error: errorMessages.generationFailed,
    //     });
    //     return;
    // }
    // generatedTTLObject.entities = result
    // // writeToLog(logFilenames.start, "Properties Generated: " + generatedTTLObject.entities, '');

    // io.emit('generator-progress', { progress: 4 / 7, message: progressMessages.iterative.relations });
    // result = await requestKgGen(llm, iterativeSystemPrompts[shot][3], `Text: ${activityText}\nEntities: ${generatedTTLObject.entities}`, logFilenames.start);
    // if (result === 'error' || result.length === 0) {
    //     res.status(200).json({
    //         error: errorMessages.generationFailed,
    //     });
    //     return;
    // }
    // generatedTTLObject.entities = result
    // // writeToLog(logFilenames.start, "Relations Generated: " + generatedTTLObject.entities, '');

    // io.emit('generator-progress', { progress: 5 / 7, message: progressMessages.iterative.tensions });
    // result = await requestKgGen(llm, iterativeSystemPrompts[shot][4], `Text: ${activityText}\nData: ${generatedTTLObject.entities}`, logFilenames.start);
    // if (result === 'error' || result.length === 0) {
    //     res.status(200).json({
    //         error: errorMessages.generationFailed,
    //     });
    //     return;
    // }
    // generatedTTLObject.conflicts = result
    // writeToLog(logFilenames.start, "Conflicts Generated: " + generatedTTLObject.conflicts, '');

    // io.emit('generator-progress', { progress: 6 / 7, message: progressMessages.iterative.merging });
    // result = await requestKgGen(llm, iterativeSystemPrompts[shot][5], `Setting: ${generatedTTLObject.setting}\nEntities: ${generatedTTLObject.entities}\nConflicts: ${generatedTTLObject.conflicts}`, logFilenames.start);
    // if (result === 'error' || result.length === 0) {
    //     res.status(200).json({
    //         error: errorMessages.generationFailed,
    //     });
    //     return;
    // }
    generatedTTL = result
    // writeToLog(logFilenames.start, "Merged TTL Generated: " + generatedTTL, '');
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
        writeToLog(logFilenames.start, "Validator Call #" + validateCount, validatorResult)
        if (validatorResult.errors.length > 0) {
            const fixedTTL = parseLLMOutput(await queryGemini(llm.id, ttlSyntaxFixPrompt, generatedTTL + '\n' + JSON.stringify(validatorResult.errors), logFilenames.start));
            if (fixedTTL === 'error' || fixedTTL.length === 0) {
                res.status(200).json({
                    error: errorMessages.generationFailed,
                });
                return;
            }
            generatedTTL = fixedTTL;
        } else {
            validated = true;
        }
    } while (!validated)
    // Return generated TTL
    res.json({
        status: 'done', ttl: generatedTTL
    });
});

export default router;
