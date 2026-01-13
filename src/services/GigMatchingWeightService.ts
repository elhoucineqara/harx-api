import gigmatchingweightRepository from '../repositories/GigMatchingWeightRepository';
import { IGigMatchingWeight } from '../models/GigMatchingWeight';

class GigMatchingWeightService {
  async getAll() {
    return gigmatchingweightRepository.find();
  }

  async getById(id: string) {
    return gigmatchingweightRepository.findById(id);
  }

  async create(data: Partial<IGigMatchingWeight>) {
    return gigmatchingweightRepository.create(data);
  }

  async update(id: string, data: Partial<IGigMatchingWeight>) {
    return gigmatchingweightRepository.updateById(id, data);
  }

  async delete(id: string) {
    return gigmatchingweightRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return gigmatchingweightRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return gigmatchingweightRepository.count(filter);
  }
}

export default new GigMatchingWeightService();
