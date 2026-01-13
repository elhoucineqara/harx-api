import { Request, Response } from 'express';
import { authenticate } from '@/lib/auth-middleware';
import { callService } from '@/services/calls/callService';

export const get = async (req: Request, res: Response) => {
  const user = authenticate(req);
  if (!user) {
    return res.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = await callService.generateToken(user.userId);
    return res.json({
      success: true,
      token
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

