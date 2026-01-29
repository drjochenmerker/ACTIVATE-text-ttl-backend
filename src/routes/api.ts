import { Router } from 'express';
import feedbackRouter from './feedback.js';
import loginRouter from './login.js';

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
router.use('/login', loginRouter);

export default router;
