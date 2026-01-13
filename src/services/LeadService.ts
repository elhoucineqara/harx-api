import leadRepository from '../repositories/LeadRepository';
import { ILead } from '../models/Lead';

class LeadService {
  async getAll() {
    return leadRepository.find();
  }

  async getById(id: string) {
    return leadRepository.findById(id);
  }

  async create(data: Partial<ILead>) {
    return leadRepository.create(data);
  }

  async update(id: string, data: Partial<ILead>) {
    return leadRepository.updateById(id, data);
  }

  async delete(id: string) {
    return leadRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return leadRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return leadRepository.count(filter);
  }
}

export default new LeadService();
