import { Request, Response } from 'express';
import skillService from '../services/SkillService';
import dbConnect from '../lib/dbConnect';
import TechnicalSkill from '../models/TechnicalSkill';
import ProfessionalSkill from '../models/ProfessionalSkill';
import SoftSkill from '../models/SoftSkill';

class SkillController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await skillService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await skillService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Skill not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await skillService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await skillService.update(id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Skill not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await skillService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Skill not found' });
      }
      return res.json({ success: true, message: 'Skill deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get all skills by type (technical, professional, soft)
  async getAllSkillsByType(req: Request, res: Response) {
    try {
      await dbConnect();
      const { type } = req.params;
      
      console.log(`[SkillController] Getting skills for type: ${type}`);
      
      let SkillModel;
      if (type === 'technical') {
        SkillModel = TechnicalSkill;
      } else if (type === 'professional') {
        SkillModel = ProfessionalSkill;
      } else if (type === 'soft') {
        SkillModel = SoftSkill;
      } else {
        console.log(`[SkillController] Invalid skill type: ${type}`);
        return res.status(400).json({ success: false, message: 'Invalid skill type. Must be: technical, professional, or soft' });
      }

      const skills = await SkillModel.find({ isActive: true }).sort({ name: 1 });
      console.log(`[SkillController] Found ${skills.length} ${type} skills`);
      return res.json({ success: true, data: skills });
    } catch (error: any) {
      console.error(`[SkillController] Error getting ${req.params.type} skills:`, error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSkillsStats(req: Request, res: Response) {
    try {
      await dbConnect();
      const technicalCount = await TechnicalSkill.countDocuments({ isActive: true });
      const professionalCount = await ProfessionalSkill.countDocuments({ isActive: true });
      const softCount = await SoftSkill.countDocuments({ isActive: true });
      
      return res.json({
        success: true,
        data: {
          technical: technicalCount,
          professional: professionalCount,
          soft: softCount,
          total: technicalCount + professionalCount + softCount
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllSkillsGroupedByCategory(req: Request, res: Response) {
    try {
      await dbConnect();
      const { type } = req.params;
      
      let SkillModel;
      if (type === 'technical') {
        SkillModel = TechnicalSkill;
      } else if (type === 'professional') {
        SkillModel = ProfessionalSkill;
      } else if (type === 'soft') {
        SkillModel = SoftSkill;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid skill type' });
      }

      const skills = await SkillModel.find({ isActive: true }).sort({ category: 1, name: 1 });
      const grouped = skills.reduce((acc: any, skill: any) => {
        const category = skill.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(skill);
        return acc;
      }, {});

      return res.json({ success: true, data: grouped });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSkillsByCategory(req: Request, res: Response) {
    try {
      await dbConnect();
      const { type, category } = req.params;
      
      let SkillModel;
      if (type === 'technical') {
        SkillModel = TechnicalSkill;
      } else if (type === 'professional') {
        SkillModel = ProfessionalSkill;
      } else if (type === 'soft') {
        SkillModel = SoftSkill;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid skill type' });
      }

      const skills = await SkillModel.find({ category, isActive: true }).sort({ name: 1 });
      return res.json({ success: true, data: skills });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async searchSkills(req: Request, res: Response) {
    try {
      await dbConnect();
      const { type } = req.params;
      const { search } = req.query;
      
      let SkillModel;
      if (type === 'technical') {
        SkillModel = TechnicalSkill;
      } else if (type === 'professional') {
        SkillModel = ProfessionalSkill;
      } else if (type === 'soft') {
        SkillModel = SoftSkill;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid skill type' });
      }

      const query: any = { isActive: true };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      const skills = await SkillModel.find(query).sort({ name: 1 });
      return res.json({ success: true, data: skills });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSkillById(req: Request, res: Response) {
    try {
      await dbConnect();
      const { type, skillId } = req.params;
      
      let SkillModel;
      if (type === 'technical') {
        SkillModel = TechnicalSkill;
      } else if (type === 'professional') {
        SkillModel = ProfessionalSkill;
      } else if (type === 'soft') {
        SkillModel = SoftSkill;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid skill type' });
      }

      const skill = await SkillModel.findById(skillId);
      if (!skill) {
        return res.status(404).json({ success: false, message: 'Skill not found' });
      }

      return res.json({ success: true, data: skill });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAgentSkills(req: Request, res: Response) {
    try {
      // TODO: Implement get agent skills
      return res.json({ success: true, data: [] });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async addSkillsToAgent(req: Request, res: Response) {
    try {
      // TODO: Implement add skills to agent
      return res.json({ success: true, message: 'Skills added to agent' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateAgentSkills(req: Request, res: Response) {
    try {
      // TODO: Implement update agent skills
      return res.json({ success: true, message: 'Agent skills updated' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async removeSkillsFromAgent(req: Request, res: Response) {
    try {
      // TODO: Implement remove skills from agent
      return res.json({ success: true, message: 'Skills removed from agent' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new SkillController();
