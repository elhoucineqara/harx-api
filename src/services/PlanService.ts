import planRepository from '../repositories/PlanRepository';
import { IPlan } from '../models/Plan';

class PlanService {
  async getAll() {
    return planRepository.find();
  }

  async getById(id: string) {
    return planRepository.findById(id);
  }

  async create(data: Partial<IPlan>) {
    return planRepository.create(data);
  }

  async update(id: string, data: Partial<IPlan>) {
    return planRepository.updateById(id, data);
  }

  async delete(id: string) {
    return planRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return planRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return planRepository.count(filter);
  }
}

export default new PlanService();
