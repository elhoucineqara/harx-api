import express from 'express';
import dbConnect from '../lib/dbConnect';
import ProfessionalSkill from '../models/ProfessionalSkill';
import SoftSkill from '../models/SoftSkill';
import TechnicalSkill from '../models/TechnicalSkill';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    await dbConnect();
    const searchParams = req.query;
    const category = searchParams.category;
    
    // If category is specified, return only that category
    if (category === 'professional') {
      const professional = await ProfessionalSkill.find({ isActive: true });
      return res.json({ success: true, data: professional });
    }
    
    if (category === 'soft') {
      const soft = await SoftSkill.find({ isActive: true });
      return res.json({ success: true, data: soft });
    }
    
    if (category === 'technical') {
      const technical = await TechnicalSkill.find({ isActive: true });
      return res.json({ success: true, data: technical });
    }
    
    // Return all skills if no category specified
    return res.json({ success: true, message: 'Please specify a category' });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
