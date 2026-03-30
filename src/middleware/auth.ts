import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { writeToLog } from '../services/utils.js';
import { logFilenames } from '../data/staticContent.js';

type AuthenticatedUser = JwtPayload & {
    role: string;
    timestamp: number;
};

export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

const isAuthenticatedUser = (user: string | JwtPayload): user is AuthenticatedUser => {
    return typeof user !== 'string' && typeof user.role === 'string' && typeof user.timestamp === 'number';
};

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    writeToLog(logFilenames.misc, "Authentication attempt: ", JSON.stringify(req.headers));
    if (!token) {
        writeToLog(logFilenames.misc, "Missing authentication token: ", JSON.stringify(req.headers));
        res.status(401).json({
            success: false,
            error: 'Access denied. No authentication token provided.'
        });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'activate-secret-key';

    jwt.verify(token, jwtSecret, (err: VerifyErrors | null, user?: string | JwtPayload) => {
        if (err || !user || !isAuthenticatedUser(user)) {
            writeToLog(logFilenames.misc, "Invalid or expired token: ", err?.message ?? 'Invalid authentication payload.');
            res.status(403).json({
                success: false,
                error: 'Invalid or expired authentication token.'
            });
            return;
        }

        req.user = user;
        next();
    });
};

export const requireInstructor = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        writeToLog(logFilenames.misc, "Missing authentication token for instructor operation: ", JSON.stringify(req.headers));
        res.status(401).json({
            success: false,
            error: 'Access denied. Instructor authentication required.'
        });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'activate-secret-key';

    jwt.verify(token, jwtSecret, (err: VerifyErrors | null, user?: string | JwtPayload) => {
        if (err || !user || !isAuthenticatedUser(user)) {
            writeToLog(
                logFilenames.misc,
                "Invalid or expired token for instructor operation: ",
                err?.message ?? 'Invalid authentication payload.'
            );
            res.status(403).json({
                success: false,
                error: 'Invalid or expired authentication token.'
            });
            return;
        }

        // Check if user has instructor/root role
        if (user.role !== 'root') {
            writeToLog(logFilenames.misc, "Non-instructor user attempted instructor operation: ", JSON.stringify({ role: user.role }));
            res.status(403).json({
                success: false,
                error: 'Access denied. Instructor-only operation.'
            });
            return;
        }

        req.user = user;
        next();
    });
};
