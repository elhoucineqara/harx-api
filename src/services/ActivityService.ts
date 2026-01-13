import activityRepository from '../repositories/ActivityRepository';
import { IActivity } from '../models/Activity';

class ActivityService {
  async getAllActivities() {
    return activityRepository.find();
  }

  async getActivityById(id: string) {
    return activityRepository.findById(id);
  }

  async createActivity(data: Partial<IActivity>) {
    return activityRepository.create(data);
  }
}

export default new ActivityService();

