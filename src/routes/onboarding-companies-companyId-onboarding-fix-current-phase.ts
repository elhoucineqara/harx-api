import { Request, Response } from 'express';
import onboardingProgressService from '../services/onboardingProgressService';

export async function PUT(req: Request, res: Response) {
  try {
    const { companyId } = req.params;
    const progress = await onboardingProgressService.fixCurrentPhase(companyId);
    return res.json({
        message: 'Current phase fixed successfully',
        progress
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}



