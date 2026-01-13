import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { userId } = body;

    if (!userId) {
      return res.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await authService.verifyAccount(userId);
    return res.json(result, { status: 200 });
  } catch (error: any) {
    return res.json({ error: error.message }, { status: 500 });
  }
}



