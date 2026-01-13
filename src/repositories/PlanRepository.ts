import { BaseRepository } from './BaseRepository';
import Plan, { IPlan } from '../models/Plan';

class PlanRepository extends BaseRepository<IPlan> {
  constructor() {
    super(Plan);
  }
}

export default new PlanRepository();
