import express, { Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes/api';

const app = express();
const port = process.env.BACKEND_PORT || 8500;

// Swagger Setup
const swaggerSpec = swaggerJsdoc({
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Activate Text zu Knowledge Graph Backend API Documentation',
            version: '0.0.1',
            description: 'Backend for the Activate Text to Knowledge Graph project. The backend is responsible for performing requests to the various LLMs and other APIs used for verification and storage purposes.',
        },
    },
    apis: ['./src/routes/*.ts', './src/routes/*/*.ts']
});

// API Endpoints
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRouter);

// Starte den Server
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
