import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import Sector from '../models/Sector';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const items = await Sector.find();
    return res.json({ success: true, data: items });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
