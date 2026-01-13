import sectorRepository from '../repositories/SectorRepository';
import { ISector } from '../models/Sector';

class SectorService {
  async getAll() {
    return sectorRepository.find();
  }

  async getById(id: string) {
    return sectorRepository.findById(id);
  }

  async create(data: Partial<ISector>) {
    return sectorRepository.create(data);
  }

  async update(id: string, data: Partial<ISector>) {
    return sectorRepository.updateById(id, data);
  }

  async delete(id: string) {
    return sectorRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return sectorRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return sectorRepository.count(filter);
  }
}

export default new SectorService();
