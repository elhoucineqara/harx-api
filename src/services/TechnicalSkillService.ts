import technicalskillRepository from '../repositories/TechnicalSkillRepository';
import { ITechnicalSkill } from '../models/TechnicalSkill';

class TechnicalSkillService {
  async getAll() {
    return technicalskillRepository.find();
  }

  async getById(id: string) {
    return technicalskillRepository.findById(id);
  }

  async create(data: Partial<ITechnicalSkill>) {
    return technicalskillRepository.create(data);
  }

  async update(id: string, data: Partial<ITechnicalSkill>) {
    return technicalskillRepository.updateById(id, data);
  }

  async delete(id: string) {
    return technicalskillRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return technicalskillRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return technicalskillRepository.count(filter);
  }
}

export default new TechnicalSkillService();
