import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const result = await authService.login(body.email, body.password, req);
    
    return res.json({ 
      message: 'Verification code sent', 
      data: { code: result.verificationCode } 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Login error:", error.message);
    return res.json({ error: "Invalid credentials" }, { status: 400 });
  }
}



