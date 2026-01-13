import currencyRepository from '../repositories/CurrencyRepository';
import { ICurrency } from '../models/Currency';

class CurrencyService {
  async getAll() {
    return currencyRepository.find();
  }

  async getById(id: string) {
    return currencyRepository.findById(id);
  }

  async create(data: Partial<ICurrency>) {
    return currencyRepository.create(data);
  }

  async update(id: string, data: Partial<ICurrency>) {
    return currencyRepository.updateById(id, data);
  }

  async delete(id: string) {
    return currencyRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return currencyRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return currencyRepository.count(filter);
  }
}

export default new CurrencyService();
