import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes/api.js';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import { createServer } from 'node:http';
import { setupSocketIO } from './socket.js';
import dotenv from 'dotenv';

const app = express();
app.use(express.json({limit: "50mb"}));
app.set('trust proxy', 1);
const server = createServer(app);
server.setTimeout(300000); // TODO: set to 5 minutes
const port = process.env.BACKEND_PORT || 8500;

dotenv.config({ path: '.env' });

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

// API Endpoints
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRouter);

// Start Server and Socket.IO
setupSocketIO(server);
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/docs`);
});
