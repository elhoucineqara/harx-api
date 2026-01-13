import softskillRepository from '../repositories/SoftSkillRepository';
import { ISoftSkill } from '../models/SoftSkill';

class SoftSkillService {
  async getAll() {
    return softskillRepository.find();
  }

  async getById(id: string) {
    return softskillRepository.findById(id);
  }

  async create(data: Partial<ISoftSkill>) {
    return softskillRepository.create(data);
  }

  async update(id: string, data: Partial<ISoftSkill>) {
    return softskillRepository.updateById(id, data);
  }

  async delete(id: string) {
    return softskillRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return softskillRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return softskillRepository.count(filter);
  }
}

export default new SoftSkillService();
