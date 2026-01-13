import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import Currency from '../models/Currency';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const items = await Currency.find();
    return res.json({ success: true, data: items });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Currency ID or code is required'
      });
    }

    let currency;

    // Check if it's a MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      // Search by MongoDB ID
      currency = await Currency.findById(id).lean();
    } else {
      // Search by currency code (e.g., GBP, USD, EUR)
      currency = await Currency.findOne({ code: id.toUpperCase() }).lean();
    }

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    return res.json({ success: true, data: currency });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
