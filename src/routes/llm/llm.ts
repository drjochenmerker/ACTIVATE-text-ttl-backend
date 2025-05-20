// src/routes/llm.ts
import { Router } from 'express';
import ollamaRouter from './ollama';
import geminiRouter from './gemini';
import openaiRouter from './azure';
import openRouter from './openRouter';

/**
 * Manages all subroutes regarding llms
 */

/**
 * @swagger
 * tags:
 *   - name: Gemini
 *     description: Endpoints for Gemini
 *   - name: Azure
 *     description: Endpoints for Azure
 *   - name: Ollama
 *     description: Endpoints for Ollama
 *   - name: OpenRouter
 *     description: Endpoints for OpenRouter
 */

const router = Router();

router.use('/ollama', ollamaRouter);
router.use('/gemini', geminiRouter);
router.use('/azure', openaiRouter);
router.use('/openRouter', openRouter)

export default router;
