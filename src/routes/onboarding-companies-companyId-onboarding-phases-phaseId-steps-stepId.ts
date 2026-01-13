import { Request, Response } from 'express';
import onboardingProgressService from '../services/onboardingProgressService';

export async function PUT(req: Request, res: Response) {
  try {
    const { companyId, phaseId, stepId } = req.params;
    const body = req.body;
    const { status } = body;
    const progress = await onboardingProgressService.updateStepProgress(companyId, parseInt(phaseId), parseInt(stepId), status);
    return res.json(progress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}



