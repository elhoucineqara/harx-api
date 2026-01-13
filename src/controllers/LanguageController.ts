import { Request, Response } from 'express';
import languageService from '../services/LanguageService';

class LanguageController {
  getLanguageByCode(arg0: string, getLanguageByCode: any) {
      throw new Error('Method not implemented.');
  }
  getLanguageStats(arg0: string, getLanguageStats: any) {
      throw new Error('Method not implemented.');
  }
  searchLanguages(arg0: string, searchLanguages: any) {
      throw new Error('Method not implemented.');
  }
  getPopularLanguages(arg0: string, getPopularLanguages: any) {
      throw new Error('Method not implemented.');
  }
  getAllLanguages(arg0: string, getAllLanguages: any) {
      throw new Error('Method not implemented.');
  }
  async getAll(req: Request, res: Response) {
    try {
      const items = await languageService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await languageService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Language not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await languageService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await languageService.update(id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Language not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await languageService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Language not found' });
      }
      return res.json({ success: true, message: 'Language deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new LanguageController();
