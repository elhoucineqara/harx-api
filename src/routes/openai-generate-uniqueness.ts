import { Request, Response } from 'express';
import openaiService from '../services/openaiService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { profile } = body;
    const result = await openaiService.generateUniquenessCategories(profile);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}



