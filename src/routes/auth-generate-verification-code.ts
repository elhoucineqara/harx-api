import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { email } = body;
    const result = await authService.generateVerificationCodeForRecovery(email);
    return res.json(result, { status: 200 });
  } catch (error: any) {
    return res.json({ message: error.message }, { status: 500 });
  }
}



