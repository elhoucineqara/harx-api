import { Request, Response } from 'express';
import { authenticate } from '@/lib/auth-middleware';
import { callService } from '@/services/calls/callService';

export const post = async (req: Request, res: Response) => {
  const user = authenticate(req);
  if (!user) {
    return res.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = req.body;
    const { to } = body; // Frontend sends { to: phoneNumber }

    if (!to) {
       return res.json({ error: 'Phone number required' }, { status: 400 });
    }

    const call = await callService.initiateCall(user.userId, to);

    return res.json({
      success: true,
      data: call
    }, { status: 201 });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

