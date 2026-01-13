import phonenumberRepository from '../repositories/PhoneNumberRepository';
import { IPhoneNumber } from '../models/PhoneNumber';

class PhoneNumberService {
  async getAll() {
    return phonenumberRepository.find();
  }

  async getById(id: string) {
    return phonenumberRepository.findById(id);
  }

  async create(data: Partial<IPhoneNumber>) {
    return phonenumberRepository.create(data);
  }

  async update(id: string, data: Partial<IPhoneNumber>) {
    return phonenumberRepository.updateById(id, data);
  }

  async delete(id: string) {
    return phonenumberRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return phonenumberRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return phonenumberRepository.count(filter);
  }
}

export default new PhoneNumberService();
