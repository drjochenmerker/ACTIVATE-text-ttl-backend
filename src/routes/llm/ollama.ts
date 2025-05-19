// src/routes/ollama.ts
import { Router, Request, Response } from 'express';
import { Ollama } from 'ollama';

const ollama = new Ollama();

/**
 * @openapi
 * /api/llm/ollama/list:
 *   get:
 *     description: Lists all available local models from the Ollama
 *     tags: [LLM]
 *     responses:
 *       200:
 *         description: List of available models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "llama2"
 *                       model:
 *                         type: string
 *                         example: "llama2-7b"
 */

const router = Router();

router.get('/list', async (req: Request, res: Response) => {
    const ollamares = await ollama.list();
    console.log(ollamares.models);
    res.json({
        models: ollamares.models.map((model) => ({
            name: model.name,
            model: model.model,
        })),
    });
});

export default router;
