import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { userId, otp } = body;

    if (!userId || !otp) {
      return res.json({ error: 'userId and otp are required' }, { status: 400 });
    }

    const result = await authService.verifyOTPTwilio(userId, otp);
    return res.json(result, { status: 200 });
  } catch (error: any) {
    return res.json({ error: error.message }, { status: 500 });
  }
}



