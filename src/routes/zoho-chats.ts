import { Request, Response } from 'express';
import { authenticate } from '../lib/auth-middleware';
import { zohoService } from '../services/zohoService';

export const get = async (req: Request, res: Response) => {
  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = await zohoService.getChats(user.userId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

