import skillRepository from '../repositories/SkillRepository';
// import { ISkill } from '../models/Skill';

class SkillService {
  async getAll() {
    return skillRepository.find();
  }

  async getById(id: string) {
    return skillRepository.findById(id);
  }

  async create(data: any) {
    return skillRepository.create(data);
  }

  async update(id: string, data: any) {
    return skillRepository.updateById(id, data);
  }

  async delete(id: string) {
    return skillRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return skillRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return skillRepository.count(filter);
  }
}

export default new SkillService();
