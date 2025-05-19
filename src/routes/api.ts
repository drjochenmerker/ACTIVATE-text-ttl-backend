import { Router } from 'express';
import llmRouter from './llm/llm';

/**
 * Manages all api subroutes
 */

const router = Router();

router.use('/llm', llmRouter);

export default router;
