import { BaseRepository } from './BaseRepository';
import SoftSkill, { ISoftSkill } from '../models/SoftSkill';

class SoftSkillRepository extends BaseRepository<ISoftSkill> {
  constructor() {
    super(SoftSkill);
  }
}

export default new SoftSkillRepository();
