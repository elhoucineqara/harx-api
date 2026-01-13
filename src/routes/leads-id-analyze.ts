import { Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { leadService } from '../services/leads/leadService';

export async function analyzeLead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analysis = await leadService.analyzeLead(id);
    
    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}


