import industryRepository from '../repositories/IndustryRepository';
import { IIndustry } from '../models/Industry';

class IndustryService {
  async getAll() {
    return industryRepository.find();
  }

  async getById(id: string) {
    return industryRepository.findById(id);
  }

  async create(data: Partial<IIndustry>) {
    return industryRepository.create(data);
  }

  async update(id: string, data: Partial<IIndustry>) {
    return industryRepository.updateById(id, data);
  }

  async delete(id: string) {
    return industryRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return industryRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return industryRepository.count(filter);
  }
}

export default new IndustryService();
