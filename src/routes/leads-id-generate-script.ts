import { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { leadService } from '../services/leads/leadService';

export async function generateScript(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { type } = req.body;
    
    const script = await leadService.generateScript(id, type);
    
    return res.json({
      success: true,
      data: script
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}


