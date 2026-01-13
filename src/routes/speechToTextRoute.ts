import express from 'express';
var router = express.Router();
import multer from 'multer';

import * as speechToTextController from '../controllers/SpeechToTextController';

router.get("/test", async (req, res) => {
    res.json("Test Speech To Text route !!!");
});

// Genereate a transscription of an audio to text
const upload = multer({ storage: multer.memoryStorage() });
router.post('/', upload.single("audioFile"), speechToTextController.transcribe);



/* router.post('/transcribe', speechToTextController.transcribe); */
export default router;
router.post('/transcribe', speechToTextController.transcribeLongAudio);