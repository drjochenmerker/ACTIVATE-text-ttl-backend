// src/routes/llm.ts
import { Router } from 'express';
import ollamaRouter from './ollama';
import geminiRouter from './gemini';

/**
 * Manages all subroutes regarding llms
 */

/**
 * @swagger
 * tags:
 *  name: LLM
 *  description: Endpoints for LLMs
 */

const router = Router();

router.use('/ollama', ollamaRouter);
router.use('/gemini', geminiRouter);

export default router;
