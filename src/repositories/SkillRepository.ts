import { BaseRepository } from './BaseRepository';
import { ProfessionalSkill } from '../models/Skill';
import { Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class SkillRepository extends BaseRepository<ISkill> {
  constructor() {
    super(ProfessionalSkill as any);
  }
}

export default new SkillRepository();
