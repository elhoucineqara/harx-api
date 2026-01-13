import { Request, Response } from 'express';
import { authenticate } from '../lib/auth-middleware';
import { zohoService } from '../services/zohoService';

export async function GET(req: Request, res: Response) {
  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const data = await zohoService.getConversationMessages(user.userId, id);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function POST(req: Request, res: Response) {
  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    const data = await zohoService.sendMessage(user.userId, id, text);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

