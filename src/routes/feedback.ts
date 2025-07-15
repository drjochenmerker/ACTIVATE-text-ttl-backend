// src/routes/feedback.ts
import { Router } from 'express';
import { supportedLLMs } from '../data/resources.js';
import { errorMessages, logFilenames } from '../data/staticContent.js';
import { removeAtLines, requestKgGen, writeToLog } from '../services/utils.js';
import { validate, validateTTLObject } from '../services/validator.js';
import { feedbackSystemPrompts, settingGenerationPrompts, ttlMergePrompts, ttlSyntaxFixPrompt } from '../data/prompts.js';

const router = Router();

const LLM_ID: string = 'gemini-2.5-flash'; // Default LLM ID for feedback generation

/**
 * @swagger
 * /api/feedback/settingGen:
 *   post:
 *     summary: Generate medical simulation setting and entity descriptions in TTL format
 *     description: |
 *       Accepts a medical simulation description and generates corresponding TTL (Turtle) data containing:
 *       1. **Setting Information**: Extracts a fitting name and description for the simulation setting
 *       2. **Entity Extraction**: Identifies all entities present in the simulation and assigns them appropriate classes
 *       
 *       The system processes the input through two stages:
 *       - **Setting Extraction**: Generates ActivityName and ActivityDescription with multilingual labels
 *       - **Entity Classification**: Assigns entities to activity theory classes (Subject, Object, Instrument, Rule, Community, DivisionOfLabour)
 *       
 *       Key features:
 *       - Always includes an Instructor entity as a Subject
 *       - Generates labels in German, English, and Swedish
 *       - Validates generated TTL before returning
 *       - Removes @prefix lines from entity output for cleaner integration
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - setting
 *             properties:
 *               setting:
 *                 type: string
 *                 description: |
 *                   Description of the medical simulation scenario. Should include context about:
 *                   - Physical setting (hospital room, clinic, home visit, etc.)
 *                   - Participants involved (patients, healthcare professionals, family members)
 *                   - Scenario context (medical condition, care situation, interprofessional collaboration)
 *                   - Activities or interactions taking place
 *           example:
 *             setting: "A hospice room where a terminally ill patient is cared for by a nurse and visited by family members. The simulation focuses on end-of-life care communication and emotional support."
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
 *                   description: Status of the operation ('done' on success).
 *                 ttl:
 *                   type: string
 *                   description: |
 *                     Combined TTL output containing:
 *                     - Setting definition with ActivityName and ActivityDescription in multiple languages
 *                     - Entity definitions with assigned activity theory classes and multilingual labels
 *                     - Cleaned entity output (without @prefix lines for easier integration)
 *                 error:
 *                   type: string
 *                   description: Error message if generation or validation failed.
 *               example:
 *                 status: "done"
 *                 ttl: |
 *                   @prefix : <http://activate.htwk-leipzig.de/model#> .
 *                   @prefix owl: <http://www.w3.org/2002/07/owl#> .
 *                   @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
 *                   
 *                   :HospiceCareSimulation a owl:NamedIndividual ;
 *                       :ActivityDescription "End-of-life care simulation in hospice setting"@en ;
 *                       :ActivityName "Hospice Care Simulation"@en .
 *                   
 *                   :Patient1 a :Object, owl:NamedIndividual ;
 *                       rdfs:label "Terminally Ill Patient"@en .
 *                   
 *                   :Nurse1 a :Subject, owl:NamedIndividual ;
 *                       rdfs:label "Hospice Nurse"@en .
 */
router.post('/settingGen', async (req, res) => {
    writeToLog(logFilenames.feedback, "Trying to generate setting: ", JSON.stringify(req.body));
    const settingText = req.body.setting;
    const llm = supportedLLMs.find((llm) => llm.id === LLM_ID);
    // Check if request has all required fields
    if (!settingText || !llm) {
        res.status(200).json({
            error: errorMessages.missingFields,
        });
        return;
    }
    // Parse setting
    let generatedTTLObject = {
        setting: '',
        entities: '',
    }
    let result: string;
    writeToLog(logFilenames.feedback, "Starting Setting Generator", '');
    // Setting Extraction
    result = await requestKgGen(llm, settingGenerationPrompts[0], settingText, logFilenames.feedback);
    if (result === 'error' || result.length === 0) {
        res.status(200).json({
            error: errorMessages.generationFailed,
        });
        return;
    }
    generatedTTLObject.setting = result;

    // Entity Extraction
    result = await requestKgGen(llm, settingGenerationPrompts[1], settingText, logFilenames.feedback);
    if (result === 'error' || result.length === 0) {
        res.status(200).json({
            error: errorMessages.generationFailed,
        });
        return;
    }
    generatedTTLObject.entities = result;

    // Validate generated TTL
    const validatorRes = await validateTTLObject(generatedTTLObject, logFilenames.feedback, llm)
    if (!validatorRes) {
        res.status(200).json({
            error: errorMessages.validationFailed,
        });
        return;
    }
    // Merge and return
    writeToLog(logFilenames.feedback, "Generated TTL", validatorRes.setting + removeAtLines(validatorRes.entities));
    res.json({
        status: 'done', ttl: validatorRes.setting + removeAtLines(validatorRes.entities)
    });
});

/**
 * @swagger
 * /api/feedback/submit:
 *   post:
 *     summary: Parse structured feedback and generate TTL entities and tensions/conflicts
 *     description: |
 *       Accepts structured feedback from a medical simulation participant and generates corresponding TTL (Turtle) data for:
 *       1. Additional entities mentioned in the feedback
 *       2. Tensions, feedbacks, and (self)impressions as conflicts with comments
 *       
 *       The system processes feedback containing role, case information, and structured question-answer pairs to extract:
 *       - New entities and assign them appropriate classes
 *       - Conflicts/tensions with participants from valid class combinations
 *       - Comments and responses to conflicts
 *       
 *       Validates the generated TTL before returning.
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
 *                 description: Description of the medical simulation setting/context.
 *               entities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       description: The label/name of the entity.
 *                     classes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: The classes/types of the entity.
 *                 description: Existing entities in the setting as tuples of (entity, entityClass). Optional.
 *               feedback:
 *                 type: object
 *                 description: Structured feedback object containing role, case, and question-answer data.
 *                 properties:
 *                   role:
 *                     type: string
 *                     description: Role of the participant providing feedback.
 *                   case:
 *                     type: string
 *                     description: Case or scenario name.
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         question1:
 *                           type: string
 *                           description: First reflection question.
 *                         answer1:
 *                           type: string
 *                           description: Answer to the first question.
 *                         question2:
 *                           type: string
 *                           description: Second reflection question (positive aspects).
 *                         answer2:
 *                           type: string
 *                           description: Answer to the second question.
 *                         question3:
 *                           type: string
 *                           description: Third reflection question (negative aspects).
 *                         answer3:
 *                           type: string
 *                           description: Answer to the third question.
 *           example:
 *             setting: "A hospice room where a terminally ill patient is cared for by a nurse and visited by family members"
 *             entities:
 *               - label: "patient"
 *                 classes: ["subject"]
 *               - label: "nurse"
 *                 classes: ["subject"]
 *               - label: "familyMember"
 *                 classes: ["object"]
 *             feedback: {
 *               "role": "Ärztin",
 *               "case": "Lungenkarziom 1",
 *               "data": [
 *                 {
 *                   "question1": "How do you feel about the interprofessional collaboration simulation you have just completed?",
 *                   "answer1": "- war ruhiger als gestern\n- innerlich weniger angespannt\n- inhaltlich schwieriges Thema\n- zum Schluss unsicher, was ich noch sagen soll",
 *                   "question2": "Think of a part of the activity that you found very positive, constructive or satisfying. Please describe what happened in this phase in a few sentences.",
 *                   "answer2": "- versucht viel zuzuhören\n- Message gut rübergebracht\n- nach dem relvanten Inhalt versucht über andere, positive Dinge zu reden",
 *                   "question3": "Think of a part of the activity that you found very negative, counterproductive or disappointing. Please describe what happened in this phase in a few sentences.",
 *                   "answer3": "- Inhalt schon abgearbeitet, Dozentin hat aber noch nicht geklopft"
 *                 }
 *               ]
 *             }
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
 *                   description: Status of the operation ('done' on success).
 *                 ttl:
 *                   type: object
 *                   description: Generated TTL data containing entities and tensions/conflicts with multilingual labels.
 *                   properties:
 *                     entities:
 *                       type: string
 *                       description: TTL representation of additional entities found in feedback.
 *                     tensions:
 *                       type: string
 *                       description: TTL representation of conflicts, tensions, and comments extracted from feedback.
 *                 error:
 *                   type: string
 *                   description: Error message if generation or validation failed.
 */
router.post('/submit', async (req, res) => {
    writeToLog(logFilenames.feedback, "Trying to parse feedback: ", JSON.stringify(req.body));
    const feedbackSetting = req.body.setting;
    const settingEntities = JSON.stringify(req.body.entities) || [];
    const feedback = JSON.stringify(req.body.feedback);
    const llm = supportedLLMs.find((llm) => llm.id === LLM_ID);
    // Check if request has all required fields
    if (!feedbackSetting || !feedback || !llm) {
        res.status(200).json({
            error: errorMessages.missingFields,
        });
        return;
    }
    // Parse feedback
    let generatedTTLObject = {
        entities: '',
        tensions: '',
    }
    let result: string;
    writeToLog(logFilenames.feedback, "Starting Submission Parser", '');

    // Entity Extraction
    result = await requestKgGen(llm, feedbackSystemPrompts[0], `
            Setting: ${feedbackSetting}
            Existing Entities: ${settingEntities}
            Feedback: ${feedback}
        `, logFilenames.feedback);
    if (result === 'error' || result.length === 0) {
        res.status(200).json({
            error: errorMessages.generationFailed,
        });
        return;
    }
    generatedTTLObject.entities = result;

    // Tension Extraction
    result = await requestKgGen(llm, feedbackSystemPrompts[1], `
            Setting: ${feedbackSetting}
            Existing Entities: ${settingEntities} and ${generatedTTLObject.entities}
            Feedback: ${feedback}
            Timestamp: ${new Date().toISOString()}
        `, logFilenames.feedback);
    if (result === 'error' || result.length === 0) {
        res.status(200).json({
            error: errorMessages.generationFailed,
        });
        return;
    }
    generatedTTLObject.tensions = result;

    // Validate generated TTL
    const validatorRes = await validateTTLObject(generatedTTLObject, logFilenames.feedback, llm)
    if (!validatorRes) {
        res.status(200).json({
            error: errorMessages.validationFailed,
        });
        return;
    }
    writeToLog(logFilenames.feedback, "Generated TTL", removeAtLines(validatorRes.entities) + "\n#####\n" + validatorRes.tensions);
    res.json({
        status: 'done', ttl: validatorRes
    });
});

/**
 * @swagger
 * /api/feedback/pool:
 *   post:
 *     summary: Merge multiple TTL entities and tensions/conflicts into consolidated output
 *     description: |
 *       Accepts multiple TTL (Turtle) inputs containing entities and tensions/conflicts from different sources 
 *       and semantically merges them into a single, consolidated TTL output. This endpoint is used to combine
 *       results from multiple feedback submissions into a unified knowledge graph.
 *       
 *       The merging process:
 *       - **Entities**: Combines multiple entity TTL inputs by merging triples semantically, avoiding duplicates
 *       - **Tensions/Conflicts**: Merges conflicts intelligently by:
 *         - Combining semantically identical feedback from different authors
 *         - Converting responses to existing conflicts into comments with HasComment relations
 *         - Merging participants and descriptions when appropriate
 *       
 *       The system ensures no duplicate triples and maintains semantic consistency across the merged output.
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entities
 *               - tensions
 *             properties:
 *               entities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of TTL strings containing entity definitions from multiple sources to be merged.
 *               tensions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of TTL strings containing conflict/tension definitions from multiple sources to be merged.
 *           example:
 *             entities: [
 *               "@prefix : <http://activate.htwk-leipzig.de/model#> .\n:Patient1 a :Subject ;\n  rdfs:label \"Patient\"@en .",
 *               "@prefix : <http://activate.htwk-leipzig.de/model#> .\n:Nurse1 a :Subject ;\n  rdfs:label \"Nurse\"@en ."
 *             ]
 *             tensions: [
 *               "@prefix : <http://activate.htwk-leipzig.de/model#> .\n:Conflict1 a :Conflict ;\n  :ConflictTitle \"Communication Issue\"@en .",
 *               "@prefix : <http://activate.htwk-leipzig.de/model#> .\n:Conflict2 a :Conflict ;\n  :ConflictTitle \"Time Pressure\"@en ."
 *             ]
 *     responses:
 *       200:
 *         description: Merging result or error message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the operation ('done' on success).
 *                 ttl:
 *                   type: string
 *                   description: Merged TTL output combining all entities and tensions into a single, consolidated knowledge graph.
 *                 error:
 *                   type: string
 *                   description: Error message if merging or validation failed.
 */

router.post('/pool', async (req, res) => {
    writeToLog(logFilenames.feedback, "Trying to pool results: ", JSON.stringify(req.body));
    const entityPool = req.body.entities;
    const tensionPool = req.body.tensions;
    const llm = supportedLLMs.find((llm) => llm.id === LLM_ID);
    // Check if request has all required fields
    if (!entityPool || !tensionPool || !llm) {
        res.status(200).json({
            error: errorMessages.missingFields,
        });
        return;
    }

    // Parse feedback
    let generatedTTLObject = {
        entities: '',
        tensions: '',
    }
    let result: string;
    writeToLog(logFilenames.feedback, "Starting semantic merging process", '');

    // Entity Merge
    result = await requestKgGen(llm, ttlMergePrompts[0], entityPool, logFilenames.feedback);
    if (result === 'error' || result.length === 0) {
        res.status(200).json({
            error: errorMessages.generationFailed,
        });
        return;
    }
    generatedTTLObject.entities = result;

    // Tension Merge
    result = await requestKgGen(llm, feedbackSystemPrompts[1], tensionPool, logFilenames.feedback);
    if (result === 'error' || result.length === 0) {
        res.status(200).json({
            error: errorMessages.generationFailed,
        });
        return;
    }
    generatedTTLObject.tensions = result;

    // Validate generated TTL
    const validatorRes = await validateTTLObject(generatedTTLObject, logFilenames.feedback, llm)
    if (!validatorRes) {
        res.status(200).json({
            error: errorMessages.validationFailed,
        });
        return;
    }
    writeToLog(logFilenames.feedback, "Generated TTL", validatorRes.entities + "\n#####\n" + validatorRes.tensions);
    res.json({
        status: 'done', ttl: validatorRes.entities + removeAtLines(validatorRes.tensions)
    });
});

export default router;
