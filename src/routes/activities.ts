import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import Activity from '../models/Activity';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const items = await Activity.find();
    return res.json({ success: true, data: items });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
