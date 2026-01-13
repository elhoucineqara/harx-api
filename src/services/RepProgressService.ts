import repprogressRepository from '../repositories/RepProgressRepository';
import { IRepProgress } from '../models/RepProgress';

class RepProgressService {
  async getAll() {
    return repprogressRepository.find();
  }

  async getById(id: string) {
    return repprogressRepository.findById(id);
  }

  async create(data: Partial<IRepProgress>) {
    return repprogressRepository.create(data);
  }

  async update(id: string, data: Partial<IRepProgress>) {
    return repprogressRepository.updateById(id, data);
  }

  async delete(id: string) {
    return repprogressRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return repprogressRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return repprogressRepository.count(filter);
  }
}

export default new RepProgressService();
