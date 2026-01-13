import { Request, Response } from 'express';
import express from 'express';
import analysisController from '../controllers/AnalysisController';

const router = express.Router();

// Start a new analysis for a company
router.post('/start', (req: Request, res: Response) => analysisController.startAnalysis(req, res));

// Ask a specific question about company documents
router.post('/ask', (req: Request, res: Response) => analysisController.askQuestion(req, res));

// Get the latest analysis for a company
router.get('/:companyId', (req: Request, res: Response) => analysisController.getAnalysis(req, res));

// Get all analyses for a company
router.get('/:companyId/all', (req: Request, res: Response) => analysisController.getAllAnalyses(req, res));

export default router; 