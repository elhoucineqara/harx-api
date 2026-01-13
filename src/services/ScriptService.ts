import scriptRepository from '../repositories/ScriptRepository';
import { IScript } from '../models/Script';

class ScriptService {
  async getAll() {
    return scriptRepository.find();
  }

  async getById(id: string) {
    return scriptRepository.findById(id);
  }

  async create(data: Partial<IScript>) {
    return scriptRepository.create(data);
  }

  async update(id: string, data: Partial<IScript>) {
    return scriptRepository.updateById(id, data);
  }

  async delete(id: string) {
    return scriptRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return scriptRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return scriptRepository.count(filter);
  }
}

export default new ScriptService();
