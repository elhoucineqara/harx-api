import { Request, Response } from 'express';
import onboardingProgressService from '../services/onboardingProgressService';

export async function GET(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const progress = await onboardingProgressService.getProgressByUserId(userId);
    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

