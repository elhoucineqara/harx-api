import { Request, Response } from 'express';
import phonenumberService from '../services/PhoneNumberService';

class PhoneNumberController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await phonenumberService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await phonenumberService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'PhoneNumber not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await phonenumberService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await phonenumberService.update(id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'PhoneNumber not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await phonenumberService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'PhoneNumber not found' });
      }
      return res.json({ success: true, message: 'PhoneNumber deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async searchNumbers(req: Request, res: Response) {
    return res.status(501).json({ success: false, message: 'Method not implemented' });
  }

  async searchTwilioNumbers(req: Request, res: Response) {
    return res.status(501).json({ success: false, message: 'Method not implemented' });
  }

  async purchaseNumber(req: Request, res: Response) {
    return res.status(501).json({ success: false, message: 'Method not implemented' });
  }

  async purchaseTwilioNumber(req: Request, res: Response) {
    return res.status(501).json({ success: false, message: 'Method not implemented' });
  }

  async checkGigNumber(req: Request, res: Response) {
    return res.status(501).json({ success: false, message: 'Method not implemented' });
  }

  async configureVoiceFeature(req: Request, res: Response) {
    return res.status(501).json({ success: false, message: 'Method not implemented' });
  }

  async handleTelnyxNumberOrderWebhook(req: Request, res: Response) {
    return res.status(501).json({ success: false, message: 'Method not implemented' });
  }
}

export default new PhoneNumberController();
