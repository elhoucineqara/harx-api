import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const result = await authService.linkedInAuth(body.code);
    return res.json({ token: result.token });
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return res.json({ message: 'Failed to authenticate with LinkedIn' }, { status: 500 });
  }
}



