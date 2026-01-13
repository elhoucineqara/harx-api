import gigagentRepository from '../repositories/GigAgentRepository';
import { IGigAgent } from '../models/GigAgent';

class GigAgentService {
  async getAll() {
    return gigagentRepository.find();
  }

  async getById(id: string) {
    return gigagentRepository.findById(id);
  }

  async create(data: Partial<IGigAgent>) {
    return gigagentRepository.create(data);
  }

  async update(id: string, data: Partial<IGigAgent>) {
    return gigagentRepository.updateById(id, data);
  }

  async delete(id: string) {
    return gigagentRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return gigagentRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return gigagentRepository.count(filter);
  }
}

export default new GigAgentService();
