import userRepository from '../repositories/UserRepository';
import { IUser } from '../models/User';

class UserService {
  async getAll() {
    return userRepository.find();
  }

  async getById(id: string) {
    return userRepository.findById(id);
  }

  async create(data: Partial<IUser>) {
    return userRepository.create(data);
  }

  async update(id: string, data: Partial<IUser>) {
    return userRepository.updateById(id, data);
  }

  async delete(id: string) {
    return userRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return userRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return userRepository.count(filter);
  }
}

export default new UserService();
