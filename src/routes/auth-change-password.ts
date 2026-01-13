import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return res.json({ message: 'Email and new password are required' }, { status: 400 });
    }

    const result = await authService.changePassword(email, newPassword);
    return res.json({ message: result }, { status: 200 });
  } catch (error: any) {
    return res.json({ message: error.message }, { status: 500 });
  }
}



