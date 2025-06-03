import { Router } from 'express';
import generatorRouter from './generator';
import { implementedGenerators, supportedLLMs } from '../data/resources';

/**
 * Manages api subroutes
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
 *   - name: List
 *     description: Endpoints for general management
 */

const router = Router();
router.use('/generator', generatorRouter);

/**
 * @swagger
 * /api/models:
 *   get:
 *     description: List all supported LLMs
 *     tags: [List]
 *     responses:
 *       200:
 *         description: Successful connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Available LLMs"
 *                 llms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier for the LLM
 *                       name:
 *                         type: string
 *                         description: Name of the LLM
 *                       description:
 *                         type: object
 *                         description: Multi-language description of the LLM
 *                         properties:
 *                           de:
 *                             type: string
 *                             example: "Deutsche Beschreibung"
 *                           en:
 *                             type: string
 *                             example: "English description"
 *                           sv:
 *                             type: string
 *                             example: "Svensk beskrivning"
 */
router.get('/models', (_, res) => {
    // Return static list of LLMs
    res.json({
        message: 'Available LLMs',
        llms: supportedLLMs,
    });
});

/**
 * @swagger
 * /api/llm/generators:
 *   get:
 *     description: List all available generators
 *     tags: [List]
 *     responses:
 *       200:
 *         description: Successful connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Available Generators"
 *                 generators:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier for the generator
 *                       name:
 *                         type: object
 *                         description: Multi-language name of the generator
 */
router.get('/generators', (_, res) => {
    // Return static list of generators
    res.json({
        message: 'Available Generators',
        generators: implementedGenerators,
    });
});

export default router;
