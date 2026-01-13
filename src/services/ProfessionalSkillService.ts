import professionalskillRepository from '../repositories/ProfessionalSkillRepository';
import { IProfessionalSkill } from '../models/ProfessionalSkill';

class ProfessionalSkillService {
  async getAll() {
    return professionalskillRepository.find();
  }

  async getById(id: string) {
    return professionalskillRepository.findById(id);
  }

  async create(data: Partial<IProfessionalSkill>) {
    return professionalskillRepository.create(data);
  }

  async update(id: string, data: Partial<IProfessionalSkill>) {
    return professionalskillRepository.updateById(id, data);
  }

  async delete(id: string) {
    return professionalskillRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return professionalskillRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return professionalskillRepository.count(filter);
  }
}

export default new ProfessionalSkillService();
