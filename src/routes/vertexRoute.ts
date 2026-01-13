import express from 'express';
const router = express.Router();
import * as vertexController from '../controllers/VertexController';

router.get("/test", async (req: express.Request, res: express.Response) => {
  res.json("Test vertex route !!!");
});

// Genereate token using OAuth2.0 protocol
router.post('/authentication', vertexController.authenticateUser);

// Endpoint pour résumer un fichier audio
router.post('/audio/summary', vertexController.summarizeAudio);

// Endpoint pour analyser les compétences linguistiques d'un rep par rapport à une langue donnée via un audio
router.post('/language/evaluate', vertexController.evaluateRepLanguage);

// Endpoint pour analyser les compétences d'un rep dans le domaine du contact center
router.post('/contactCenter/evaluate', vertexController.evaluateRepCCSkills);

router.post('/audio/upload', vertexController.uploadAudioHandler);

export default router;
