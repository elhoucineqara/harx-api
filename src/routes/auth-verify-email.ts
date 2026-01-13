import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const result = await authService.verifyEmail(body.email, body.code);
    return res.json({ token: result.token, result });
  } catch (error: any) {
    return res.json({ message: error.message }, { status: 400 });
  }
}



