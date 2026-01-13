import express, { Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import Timezone from '../models/Timezone';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await dbConnect();
    const items = await Timezone.find();
    return res.json({ success: true, data: items });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
