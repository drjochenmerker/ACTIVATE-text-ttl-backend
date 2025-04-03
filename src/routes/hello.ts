// src/routes/hello.ts
import { Router, Request, Response } from 'express';

/**
 * @openapi
 * /api/hello:
 *   get:
 *     description: Gibt eine einfache Nachricht zurück
 *     responses:
 *       200:
 *         description: Eine einfache Nachricht
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello, world!"
 */
const router = Router();

router.get('/hello', (req: Request, res: Response) => {
    res.json({ message: 'Hello, world!' });
});

export default router;