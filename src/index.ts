import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes/api.js';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import { createServer } from 'node:http';
import { setupSocketIO } from './socket.js';

import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(express.json());
const server = createServer(app);
const port = process.env.BACKEND_PORT || 8500;

// Swagger Setup
const swaggerSpec = swaggerJsdoc({
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Activate Text to Knowledge Graph Backend API Documentation',
            version: '0.0.1',
            description:
                'Backend for the Activate Text to Knowledge Graph project. The backend is responsible for performing requests to the various LLMs and other APIs used for verification and storage purposes.',
        },
    },
    apis: ['./src/routes/*.ts', './src/routes/*/*.ts'],
});

// Middleware
app.use(
    cors({
        origin: `${process.env.ACTIVATE_URL}${!process.env.ACTIVATE_PORT ? '' : ':' + process.env.ACTIVATE_PORT}`,
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

// Rate Limiter -- 1 Minute, 250 requests
app.use(
    rateLimit({
        windowMs: 1 * 60 * 1000,
        limit: 250,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: 'Too many requests, please try again later.',
    })
);
// --- NEUER PROXY FÜR DAS WHISPER-BACKEND ---
// Diese Regel fängt Anfragen an '/api/diarize' ab, BEVOR sie 'apiRouter' erreichen.
// Sie leitet sie an den Python-Server weiter, der auf Port 8001 läuft.
interface PathRewriteMap {
    [key: string]: string;
}

type ProxyOnError = (err: Error, req: express.Request, res: express.Response) => void;

interface DiarizeProxyOptions {
    target: string;
    changeOrigin?: boolean;
    pathRewrite?: PathRewriteMap;
    onError?: ProxyOnError;
}

const diarizeProxyOptions: DiarizeProxyOptions = {
    target: 'http://localhost:8001', // TODO Die Adresse des Python-Servers (Port aus package.json)
    changeOrigin: true,
    pathRewrite: {
        '^/api/diarize': '', // Schreibt /api/diarize/api/diarize... zu /api/diarize... um
    },
    onError: (err, req, res) => {
        console.error("Proxy-Fehler:", err);
        res.status(500).send('Proxy Error: Konnte den Python-Dienst nicht erreichen.');
    },
};

app.use(
    '/api/diarize', // Der Pfad, den Ihr Frontend aufruft (z.B. /api/diarize/api/diarize_and_transcribe)
    createProxyMiddleware(diarizeProxyOptions)
);
// --- ENDE DES PROXY-ABSCHNITTS ---

// API Endpoints
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRouter);

// Start Server and Socket.IO
setupSocketIO(server);
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/docs`);
     console.log(`Proxying /api/diarize requests to http://localhost:8001`); // todo
});
