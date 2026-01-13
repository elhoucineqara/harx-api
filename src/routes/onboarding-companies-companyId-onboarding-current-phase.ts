import { Request, Response } from 'express';
import onboardingProgressService from '../services/onboardingProgressService';

export async function PUT(req: Request, res: Response) {
  try {
    const { companyId } = req.params;
    const body = req.body;
    const { phase } = body;
    const progress = await onboardingProgressService.updateCurrentPhase(companyId, parseInt(phase));
    return res.json(progress);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}



