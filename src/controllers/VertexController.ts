import { Request, Response } from 'express';
import vertexService from '../services/vertexService';
const multer = require('multer');

export const authenticateUser = async (req: Request, res: Response) => {
  try {
    const tokens: any = await vertexService.authenticate();
    res.json(tokens); // Respond with tokens
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const summarizeAudio = async (req: Request, res: Response) => {
  try {
    const fileUri = req.body.fileUri; // Extrait l'URI du fichier depuis la requête
    const prompt = req.body.prompt || 'Please analyze this audio file and summarize the contents of the audio as bullet points';

    // Generate OAuth2 token using the first endpoint logic
    const tokens: any = await vertexService.authenticate();

    console.log('tokens :', tokens);

    // Call the service to process the audio
    const summary = await vertexService.summarizeAudio(tokens.access_token, fileUri, prompt);

    res.json(summary); // Retourne le résumé au frontend
  } catch (error) {
    console.error('Error summarizing audio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Evaluate the Rep Language level
export const evaluateRepLanguage = async (req: Request, res: Response) => {
  try {
    const { fileUri, textToCompare } = req.body;

    // Validate input
    if (!fileUri || !textToCompare) {
      return res.status(400).json({ error: 'fileUri and textToCompare are required' });
    }

    const response = await vertexService.evaluateRepLanguage(fileUri, textToCompare);
    res.json(response);
  } catch (error) {
    console.error('Error during analyzing language audio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const audioUpload = async (req: Request, res: Response) => {
  try {
    const { fileUri, destinationName } = req.body;

    // Validate input
    if (!fileUri || !destinationName) {
      return res.status(400).json({ error: 'fileUri or destinationName is required' });
    }

    // Call the service to upload the file
    const uploadResult = await vertexService.audioUpload(fileUri, destinationName);

    // Return the success response
    res.json(uploadResult);
  } catch (error) {
    console.error('Error uploading audio:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

const upload = multer({ storage: multer.memoryStorage() });

export const uploadAudioHandler = [
  upload.single('file'), // Middleware to handle the file upload
  async (req: Request, res: Response) => {
    try {
      const { destinationName } = req.body;

      // Validate input
      if (!req.file || !destinationName) {
        return res.status(400).json({ error: 'File and destinationName are required' });
      }

      const fileBuffer = req.file.buffer; // Get the binary content of the uploaded file

      // Upload the file using the service
      const result = await vertexService.audioUpload2(fileBuffer, destinationName);

      // Return the success response
      res.json(result);
    } catch (error) {
      console.error('Error uploading audio:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },
];

export const evaluateRepCCSkills = async (req: Request, res: Response) => {
  try {
    const { fileUri, scenarioData } = req.body;

    // Validate input
    if (!fileUri || !scenarioData) {
      return res.status(400).json({ error: 'fileUri and scenarioData are required' });
    }

    // Call the service to analyze the audio
    const analysis = await vertexService.evaluateRepCCSkills(fileUri, scenarioData);

    res.json(analysis); // Return the analysis result
  } catch (error) {
    console.error('Error analyzing audio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};