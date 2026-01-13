import zohoconfigRepository from '../repositories/ZohoConfigRepository';
import { IZohoConfig } from '../models/ZohoConfig';

class ZohoConfigService {
  async getAll() {
    return zohoconfigRepository.find();
  }

  async getById(id: string) {
    return zohoconfigRepository.findById(id);
  }

  async create(data: Partial<IZohoConfig>) {
    return zohoconfigRepository.create(data);
  }

  async update(id: string, data: Partial<IZohoConfig>) {
    return zohoconfigRepository.updateById(id, data);
  }

  async delete(id: string) {
    return zohoconfigRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return zohoconfigRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return zohoconfigRepository.count(filter);
  }
}

export default new ZohoConfigService();
