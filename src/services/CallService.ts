import callRepository from '../repositories/CallRepository';
import { ICall } from '../models/Call';

class CallService {
  async getAll() {
    return callRepository.find();
  }

  async getById(id: string) {
    return callRepository.findById(id);
  }

  async create(data: Partial<ICall>) {
    return callRepository.create(data);
  }

  async update(id: string, data: Partial<ICall>) {
    return callRepository.updateById(id, data);
  }

  async delete(id: string) {
    return callRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return callRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return callRepository.count(filter);
  }
}

export default new CallService();
