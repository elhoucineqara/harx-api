import { Request, Response } from 'express';
import telnyxrequirementgroupService from '../services/TelnyxRequirementGroupService';

class TelnyxRequirementGroupController {
  async createGroup(req: Request, res: Response) {
    try {
      const item = await telnyxrequirementgroupService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const item = await telnyxrequirementgroupService.getById(groupId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'TelnyxRequirementGroup not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getCompanyGroup(req: Request, res: Response) {
    try {
      const { companyId, destinationZone } = req.params;
      const item = await telnyxrequirementgroupService.findOne({ companyId, destinationZone });
      if (!item) {
        return res.status(404).json({ success: false, message: 'TelnyxRequirementGroup not found for this company and zone' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateRequirements(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const item = await telnyxrequirementgroupService.update(groupId, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'TelnyxRequirementGroup not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async checkCompanyRequirementsStatus(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const companyGroups = await telnyxrequirementgroupService.getAll({ companyId });
      return res.json({ success: true, data: companyGroups });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async checkGroupStatus(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const item = await telnyxrequirementgroupService.getById(groupId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'TelnyxRequirementGroup not found' });
      }
      return res.json({ success: true, status: item.status });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Keep original CRUD methods just in case they are used elsewhere
  async getAll(req: Request, res: Response) {
    try {
      const items = await telnyxrequirementgroupService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await telnyxrequirementgroupService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'TelnyxRequirementGroup not found' });
      }
      return res.json({ success: true, message: 'TelnyxRequirementGroup deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new TelnyxRequirementGroupController();
