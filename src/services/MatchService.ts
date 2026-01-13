import matchRepository from '../repositories/MatchRepository';
import { IMatch } from '../models/Match';

class MatchService {
  async getAll() {
    return matchRepository.find();
  }

  async getById(id: string) {
    return matchRepository.findById(id);
  }

  async create(data: Partial<IMatch>) {
    return matchRepository.create(data);
  }

  async update(id: string, data: Partial<IMatch>) {
    return matchRepository.updateById(id, data);
  }

  async delete(id: string) {
    return matchRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return matchRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return matchRepository.count(filter);
  }
}

export default new MatchService();
