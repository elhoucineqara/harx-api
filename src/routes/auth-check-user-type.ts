import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { userId } = body;
    const result = await authService.checkUserType(userId);
    return res.json(result);
  } catch (error: any) {
    return res.json({ error: error.message }, { status: 500 });
  }
}



