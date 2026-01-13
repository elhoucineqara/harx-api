import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { code } = body;
    const { token, user } = await authService.linkedinSignIn(code);
    return res.json({ token, user });
  } catch (error: any) {
    console.error("LinkedIn OAuth Error:", error);
    return res.json({ error: "LinkedIn authentication failed" }, { status: 500 });
  }
}



