import { Request, Response } from 'express';
const { AgentService } = require('../services/AgentService');
const agentService = new AgentService();

class AgentController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await agentService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await agentService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Agent not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await agentService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await agentService.update(id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Agent not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await agentService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Agent not found' });
      }
      return res.json({ success: true, message: 'Agent deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new AgentController();
