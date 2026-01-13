import express from 'express';
const router = express.Router();

import speechToTextController from '../controllers/speech-to-text';

router.get("/test", async (req, res) => {
    res.json({ message: "Test Speech To Text route !!!" });
});

// Genereate a transscription of a long audio to text
router.post('/transcribe', speechToTextController.transcribeLongAudio);

export default router;