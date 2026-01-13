import { Request, Response } from 'express';
import authService from '@/services/authService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    console.log("Registration attempt:", { email: body.email, fullName: body.fullName, phone: body.phone });
    const result: any = await authService.register(body, req);
    
    return res.json({ 
      message: 'Registration successful', 
      verificationCode: result.verificationCode,
      result: {
        _id: result.result._id
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.json({ message: error.message, stack: error.stack }, { status: 400 });
  }
}
