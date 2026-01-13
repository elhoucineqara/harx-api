import { BaseRepository } from './BaseRepository';
import Activity, { IActivity } from '../models/Activity';

class ActivityRepository extends BaseRepository<IActivity> {
  constructor() {
    super(Activity);
  }
}

export default new ActivityRepository();

