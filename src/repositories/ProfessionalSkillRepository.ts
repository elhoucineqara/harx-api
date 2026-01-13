import { BaseRepository } from './BaseRepository';
import ProfessionalSkill, { IProfessionalSkill } from '../models/ProfessionalSkill';

class ProfessionalSkillRepository extends BaseRepository<IProfessionalSkill> {
  constructor() {
    super(ProfessionalSkill);
  }
}

export default new ProfessionalSkillRepository();
