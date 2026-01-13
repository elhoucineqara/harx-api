import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import Match from '../models/Match';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const matches = await Match.find()
      .populate('agentId')
      .populate('gigId')
      .sort({ score: -1 });

    return res.json({ success: true, data: matches });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const matchData = req.body;

    const match = new Match(matchData);
    await match.save();

    return res.status(201).json({
      success: true,
      data: match,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
