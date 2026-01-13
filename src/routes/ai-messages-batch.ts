import { Request, Response } from 'express';
import { authenticate } from '@/lib/auth-middleware';
import AIMessage from '@/models/AIMessage';
import dbConnect from '@/lib/db/mongodb';

export const post = async (req: Request, res: Response) => {
  const user = authenticate(req);
  if (!user) {
    return res.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const messages = req.body;
    
    if (!Array.isArray(messages)) {
      return res.json({ error: 'Expected array of messages' }, { status: 400 });
    }

    await dbConnect();
    const result = await AIMessage.insertMany(messages);

    return res.json({
      success: true,
      data: result
    }, { status: 201 });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

