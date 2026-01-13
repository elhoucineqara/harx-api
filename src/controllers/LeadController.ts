import { Request, Response } from 'express';
const { LeadService } = require('../services/LeadService');
const leadService = new LeadService();

class LeadController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await leadService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await leadService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await leadService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await leadService.update(id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await leadService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }
      return res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new LeadController();
