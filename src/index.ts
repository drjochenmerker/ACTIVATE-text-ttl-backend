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
const port = process.env.BACKEND_PORT || 8500; // Behält Ihren Port bei

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
        // Ihre CORS-Einstellungen beibehalten
        origin: `${process.env.ACTIVATE_URL}${!process.env.ACTIVATE_PORT ? '' : ':' + process.env.ACTIVATE_PORT}`,
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

// Rate Limiter -- Beibehalten
app.use(
    rateLimit({
        windowMs: 1 * 60 * 1000,
        limit: 250,
        standardHeaders: 'draft-8', // Empfohlen statt 'true'
        legacyHeaders: false,
        message: 'Too many requests, please try again later.',
    })
);

// --- *** GEÄNDERTER PROXY FÜR DAS WHISPER-BACKEND *** ---
// Diese Regel fängt jetzt Anfragen an '/whisper-proxy' ab.
interface PathRewriteMap {
    [key: string]: string;
}

type ProxyOnError = (err: Error, req: express.Request, res: express.Response | any) => void; // any hinzugefügt für res.status().send()

interface DiarizeProxyOptions {
    target: string;
    changeOrigin?: boolean;
    pathRewrite?: PathRewriteMap;
    onError?: ProxyOnError;
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent'; // Für Debugging hinzugefügt
}

const diarizeProxyOptions: DiarizeProxyOptions = {
    target: 'http://localhost:8001', // Ziel bleibt der Python-Server auf Port 8001
    changeOrigin: true,
    pathRewrite: {
        '^/whisper-proxy': '', // Schreibt /whisper-proxy/api/diarize... zu /api/diarize... um
    },
    onError: (err, req, res) => {
        console.error("Proxy Error:", err);
        // Sicherstellen, dass res eine send-Methode hat (typischerweise der Fall bei Express)
        if (res && typeof res.status === 'function' && typeof res.send === 'function') {
             res.status(500).send('Proxy Error: Could not reach Python service.');
        } else {
             // Fallback, falls res kein erwartetes Response-Objekt ist
             console.error("Proxy Error: Response object is not valid.");
        }
    },
    logLevel: 'debug', // Mehr Logging vom Proxy, um zu sehen, was passiert
};

app.use(
    '/whisper-proxy', // *** NEUER PFAD *** Der Pfad, den Ihr Frontend aufruft
    createProxyMiddleware(diarizeProxyOptions)
);
// --- ENDE DES PROXY-ABSCHNITTS ---

// API Endpoints - Diese kommen NACH dem spezifischeren Proxy
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRouter); // Ihr allgemeiner API-Router

// Start Server and Socket.IO
setupSocketIO(server);
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/docs`);
    // Angepasste Log-Nachricht
    console.log(`Proxying /whisper-proxy requests to http://localhost:8001`);
});

