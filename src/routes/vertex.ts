import express from 'express';
const router = express.Router();
import vertexController from '../controllers/vertex';

router.get("/test", async (req: express.Request, res: express.Response) => {
    res.json({ message: "Test vertex route !!!" });
});

// Get the summary of an audio 
router.post('/audio/summarize', async (req: express.Request, res: express.Response) => vertexController.getAudioSummary);

// Get the transcription of an audio 
router.post('/audio/transcribe', async (req: express.Request, res: express.Response) => vertexController.getAudioTranscription);

// Get the scoring of a call 
router.post('/call/score', async (req: express.Request, res: express.Response) => vertexController.getCallScoring);

// Get suggestions of follow-up actions
router.post('/call/post-actions', async (req: express.Request, res: express.Response) => vertexController.getCallPostActions);

export default router;
