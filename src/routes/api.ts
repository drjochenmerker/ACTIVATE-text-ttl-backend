import { Router } from 'express';
import feedbackRouter from './feedback';

/**
 * Manages api subroutes
 */

/**
 * @swagger
 * tags:
 *   - name: Feedback
 *     description: Endpoints for the feedback service
 */

const router = Router();
router.use('/feedback', feedbackRouter);

export default router;
