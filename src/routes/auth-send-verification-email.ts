import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { email, code } = body;
    const result = await authService.sendVerificationEmail(email, code);
    return res.json({ message: result });
  } catch (error: any) {
    return res.json({ message: error.message }, { status: 500 });
  }
}



