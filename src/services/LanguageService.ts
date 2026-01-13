import languageRepository from '../repositories/LanguageRepository';
import { ILanguage } from '../models/Language';

class LanguageService {
  async getAll() {
    return languageRepository.find();
  }

  async getById(id: string) {
    return languageRepository.findById(id);
  }

  async create(data: Partial<ILanguage>) {
    return languageRepository.create(data);
  }

  async update(id: string, data: Partial<ILanguage>) {
    return languageRepository.updateById(id, data);
  }

  async delete(id: string) {
    return languageRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return languageRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return languageRepository.count(filter);
  }
}

export default new LanguageService();
