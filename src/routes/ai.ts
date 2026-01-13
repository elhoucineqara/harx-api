import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import aiService from '../services/aiService';
import Activity from '../models/Activity';
import Industry from '../models/Industry';
import Language from '../models/Language';
import SoftSkill from '../models/SoftSkill';
import ProfessionalSkill from '../models/ProfessionalSkill';
import TechnicalSkill from '../models/TechnicalSkill';
import Timezone from '../models/Timezone';
import Country from '../models/Country';
import Currency from '../models/Currency';

const router = Router();

// Import cv-analysis route
import cvAnalysisRouter from './ai-cv-analysis';
router.use('/', cvAnalysisRouter);

router.post('/gigs/generate', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { description } = body;

    await dbConnect();

    const [
      activities,
      industries,
      languages,
      softSkills,
      professionalSkills,
      technicalSkills,
      timezones,
      countries,
      currencies
    ] = await Promise.all([
      Activity.find(),
      Industry.find(),
      Language.find(),
      SoftSkill.find(),
      ProfessionalSkill.find(),
      TechnicalSkill.find(),
      Timezone.find(),
      Country.find(),
      Currency.find()
    ]);

    const suggestions = await aiService.generateGigSuggestions(
      description,
      activities,
      industries,
      languages,
      {
        soft: softSkills,
        professional: professionalSkills,
        technical: technicalSkills
      },
      timezones,
      countries,
      currencies
    );

    return res.json({ success: true, data: suggestions });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// TODO: Convertir manuellement la route: ai/profile-summary/route.ts
// Chemin Express: /profile-summary


router.post('/speech-to-text/transcribe', async (req: Request, res: Response) => {
  try {
    // Skip execution during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return res.status(503).json({ error: 'Service unavailable during build' });
    }
    // TODO: Implémenter la logique de transcription
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/vertex/audio/summary', async (req: Request, res: Response) => {
  try {
    // Skip execution during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return res.status(503).json({ error: 'Service unavailable during build' });
    }
    // TODO: Implémenter la logique de résumé audio
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/vertex/audio/upload', async (req: Request, res: Response) => {
  try {
    // Skip execution during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return res.status(503).json({ error: 'Service unavailable during build' });
    }
    // TODO: Implémenter la logique d'upload audio
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/vertex/contact-center/evaluate', async (req: Request, res: Response) => {
  try {
    // Skip execution during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return res.status(503).json({ error: 'Service unavailable during build' });
    }
    // TODO: Implémenter la logique d'évaluation contact center
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/vertex/language/evaluate', async (req: Request, res: Response) => {
  try {
    // Skip execution during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return res.status(503).json({ error: 'Service unavailable during build' });
    }
    // TODO: Implémenter la logique d'évaluation de langue
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
