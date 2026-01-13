import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/batch', async (req: Request, res: Response) => {
  try {
  const user = authenticate(req, res, () => {});
    if (!user) return;
    
    await dbConnect();
    const body = req.body;
    // TODO: Implémenter la logique de traitement par lot
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
}
});

export default router;
