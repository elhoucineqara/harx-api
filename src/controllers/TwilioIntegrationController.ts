import { Request, Response } from 'express';
import twiliointegrationService from '../services/TwilioIntegrationService';

class TwilioIntegrationController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await twiliointegrationService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await twiliointegrationService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'TwilioIntegration not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await twiliointegrationService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await twiliointegrationService.update(id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'TwilioIntegration not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await twiliointegrationService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'TwilioIntegration not found' });
      }
      return res.json({ success: true, message: 'TwilioIntegration deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new TwilioIntegrationController();
