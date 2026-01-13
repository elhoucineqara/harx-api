import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { leadService } from '../services/leads/leadService';

const router = Router();

// GET /leads/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = await leadService.getLeadById(id);
    
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    return res.json({
      success: true,
      data: lead
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /leads/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const lead = await leadService.updateLead(id, body);
    
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    return res.json({
      success: true,
      data: lead
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /leads/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = await leadService.deleteLead(id);
    
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    return res.json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;


