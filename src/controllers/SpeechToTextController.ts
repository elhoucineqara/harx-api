import { Request, Response } from 'express';
import speechToTextService from '../services/speechToTextService';

export const transcribe = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file uploaded" });
        }

        const { language } = req.body;
        if (!language) {
            return res.status(400).json({ error: "Missing language in request body" });
        }
        // Convert uploaded file to Base64
        const base64Audio = req.file.buffer.toString("base64");

        const transcription = await speechToTextService.transcribeAudio(base64Audio, language);
        res.json(transcription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const transcribeLongAudio = async (req: Request, res: Response) => {
    try {
        const { languageCode, fileUri } = req.body;
        console.log('languageCode',languageCode);
        console.log('fileUri',fileUri);

        if (!languageCode || !fileUri) {
            return res.status(400).json({ error: "Missing languageCode or fileUri in request body" });
        }

        const transcription = await speechToTextService.transcribeLongAudio(languageCode, fileUri);
        res.status(200).json({transcription : transcription});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};