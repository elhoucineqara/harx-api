import { Request, Response } from 'express';
import gigService from '../services/gigService';
import Lead from '../models/Lead';
import dbConnect from '../lib/dbConnect';

class GigController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await gigService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`👁️ Fetching gig ${id} with all populated data`);
      const item = await gigService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Gig not found' });
      }
      console.log(`✅ Gig ${id} fetched successfully`);
      return res.json({ success: true, data: item });
    } catch (error: any) {
      console.error(`❌ Error fetching gig ${req.params.id}:`, error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      console.log('📝 Creating gig with data:', JSON.stringify(req.body, null, 2));
      const item = await gigService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      console.error('❌ Error creating gig:', error);
      console.error('❌ Error stack:', error.stack);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to create gig',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`📝 Updating gig ${id} with data:`, JSON.stringify(req.body, null, 2));
      const item = await gigService.update(id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Gig not found' });
      }
      console.log(`✅ Gig ${id} updated successfully`);
      return res.json({ success: true, data: item, message: 'Gig updated successfully' });
    } catch (error: any) {
      console.error(`❌ Error updating gig ${req.params.id}:`, error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting gig ${id}`);
      const item = await gigService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Gig not found' });
      }
      console.log(`✅ Gig ${id} deleted successfully`);
      return res.json({ 
        success: true, 
        message: 'Gig deleted successfully',
        data: item // Retourner les données du gig supprimé avec populate
      });
    } catch (error: any) {
      console.error(`❌ Error deleting gig ${req.params.id}:`, error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getGigsByCompanyId(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const gigs = await gigService.getGigsByCompanyId(companyId);
      return res.json({ success: true, data: gigs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async hasCompanyGigs(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const gigs = await gigService.getGigsByCompanyId(companyId);
      const hasGigs = gigs && gigs.length > 0;
      return res.json({ 
        success: true, 
        message: hasGigs ? 'Company has gigs' : 'Company has no gigs',
        data: { hasGigs } 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getGigsByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const gigs = await gigService.getGigsByUserId(userId);
      return res.json({ success: true, data: gigs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async hasCompanyLeads(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      await dbConnect();
      const leadCount = await Lead.countDocuments({ companyId });
      const hasLeads = leadCount > 0;
      return res.json({ 
        success: true, 
        hasLeads,
        count: leadCount
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new GigController();
