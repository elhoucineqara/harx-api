import countryRepository from '../repositories/CountryRepository';
import { ICountry } from '../models/Country';

class CountryService {
  async getAll() {
    return countryRepository.find();
  }

  async getById(id: string) {
    return countryRepository.findById(id);
  }

  async create(data: Partial<ICountry>) {
    return countryRepository.create(data);
  }

  async update(id: string, data: Partial<ICountry>) {
    return countryRepository.updateById(id, data);
  }

  async delete(id: string) {
    return countryRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return countryRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return countryRepository.count(filter);
  }
}

export default new CountryService();
