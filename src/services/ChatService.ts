import chatRepository from '../repositories/ChatRepository';
import { IChat } from '../models/Chat';

class ChatService {
  async getAll() {
    return chatRepository.find();
  }

  async getById(id: string) {
    return chatRepository.findById(id);
  }

  async create(data: Partial<IChat>) {
    return chatRepository.create(data);
  }

  async update(id: string, data: Partial<IChat>) {
    return chatRepository.updateById(id, data);
  }

  async delete(id: string) {
    return chatRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return chatRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return chatRepository.count(filter);
  }
}

export default new ChatService();
