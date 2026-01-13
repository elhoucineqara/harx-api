import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import Country from '../models/Country';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('🌍 Fetching countries...');
    await dbConnect();
    console.log('✅ Database connected');
    
    const items = await Country.find().limit(1000).sort({ name: 1 });
    console.log(`✅ Found ${items.length} countries`);
    
    return res.json({ success: true, data: items });
  } catch (error: any) {
    console.error('❌ Error fetching countries:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch countries',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : undefined
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Country ID is required'
      });
    }

    const country = await Country.findById(id);

    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    return res.json({ success: true, data: country });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
