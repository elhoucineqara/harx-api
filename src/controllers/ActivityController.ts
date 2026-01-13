import { Request, Response } from 'express';
import activityService from '../services/ActivityService';

class ActivityController {
  async getAll(req: Request, res: Response) {
    try {
      const activities = await activityService.getAllActivities();
      return res.json({ success: true, data: activities });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const activity = await activityService.getActivityById(id);
      if (!activity) {
        return res.status(404).json({ success: false, message: 'Activity not found' });
      }
      return res.json({ success: true, data: activity });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const activity = await activityService.createActivity(req.body);
      return res.status(201).json({ success: true, data: activity });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ActivityController();

