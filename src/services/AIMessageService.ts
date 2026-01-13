import aimessageRepository from '../repositories/AIMessageRepository';
import { IAIMessage } from '../models/AIMessage';

class AIMessageService {
  async getAll() {
    return aimessageRepository.find();
  }

  async getById(id: string) {
    return aimessageRepository.findById(id);
  }

  async create(data: Partial<IAIMessage>) {
    return aimessageRepository.create(data);
  }

  async update(id: string, data: Partial<IAIMessage>) {
    return aimessageRepository.updateById(id, data);
  }

  async delete(id: string) {
    return aimessageRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return aimessageRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return aimessageRepository.count(filter);
  }
}

export default new AIMessageService();
