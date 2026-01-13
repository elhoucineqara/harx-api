import { Request, Response } from 'express';
import professionalskillService from '../services/ProfessionalSkillService';

class ProfessionalSkillController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await professionalskillService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await professionalskillService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'ProfessionalSkill not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await professionalskillService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await professionalskillService.update(id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'ProfessionalSkill not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await professionalskillService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'ProfessionalSkill not found' });
      }
      return res.json({ success: true, message: 'ProfessionalSkill deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ProfessionalSkillController();
