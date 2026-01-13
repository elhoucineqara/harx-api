import { Request, Response } from 'express';
import onboardingProgressService from '../services/onboardingProgressService';

export async function POST(req: Request, res: Response) {
  try {
    const { companyId } = req.params;
    const progress = await onboardingProgressService.resetProgress(companyId);
    return res.json(progress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}



