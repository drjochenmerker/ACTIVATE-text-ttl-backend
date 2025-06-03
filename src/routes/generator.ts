// src/routes/generator.ts
import { Router } from 'express';
import { getIO } from '../socket';
import { supportedLLMs } from '../data/resources';
import { requestPersonaGen } from '../services/generator/personaGen';
import { errorMessages } from '../data/staticContent';

const router = Router();

router.post('/debug', (req, res) => {
    res.json({
        status: 'done',
        ttl: `@prefix : <http://example.org/> .
@prefix ex: <http://example.org/> .

ex:doctor a ex:Doctor.
ex:doctor ex:hasName ex:Doctor.
ex:patient a ex:Patient.
ex:doctor ex:treated ex:patient.
ex:patient ex:asks ex:doctor.`
    })
})

router.post('/start', async (req, res) => {
    const generatorId = req.body.generatorId;
    const llmId = req.body.llmId;
    const activityText = req.body.activityText;
    const io = getIO();
    io.emit('generator-progress', 50);
    // Validate Request Body
    if (!generatorId || !llmId || !activityText) {
        res.status(200).json({
            error: errorMessages.missingFields,
        });
        return;
    }
    // Get and validate llm provider
    const llm = supportedLLMs.find((llm) => llm.id === llmId);
    if (!llm || !['openRouter'].includes(llm.endpoint)) {
        res.status(200).json({
            error: errorMessages.unsupportedLLM,
        });
    } else {
        // Start generator process and send progress updates
        let generatedTTL: string = '';
        switch (generatorId) {
            case 'persona-generator':
                generatedTTL = await requestPersonaGen(llm, activityText);
                break;
            // case 'iterative-generator':
            //     break;
            default:
                res.status(200).json({
                    error: errorMessages.unsupportedGenerator,
                });
                return;
        }
        res.json({
            status: 'done', ttl: generatedTTL.replace(/```(?:ttl)?/gi, '')
                .replace(/^\s*turtle:?/i, '')
                .trim()
        });
    }
});

export default router;
