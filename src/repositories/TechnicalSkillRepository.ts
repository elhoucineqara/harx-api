import { BaseRepository } from './BaseRepository';
import TechnicalSkill, { ITechnicalSkill } from '../models/TechnicalSkill';

class TechnicalSkillRepository extends BaseRepository<ITechnicalSkill> {
  constructor() {
    super(TechnicalSkill);
  }
}

export default new TechnicalSkillRepository();
