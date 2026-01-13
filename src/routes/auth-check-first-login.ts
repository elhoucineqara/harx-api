import { Request, Response } from 'express';
import authService from '@/services/authService';
import { isValidObjectId } from 'mongoose';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { userId } = body;

    if (!userId) {
      return res.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!isValidObjectId(userId)) {
       return res.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    const result = await authService.checkFirstLogin(userId);
    return res.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error in check-first-login:', error);
    return res.json({ error: error.message }, { status: 500 });
  }
}
