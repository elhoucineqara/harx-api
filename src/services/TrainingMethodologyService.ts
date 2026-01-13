import trainingmethodologyRepository from '../repositories/TrainingMethodologyRepository';
import { ITrainingMethodology } from '../models/TrainingMethodology';

class TrainingMethodologyService {
  async getAll() {
    return trainingmethodologyRepository.find();
  }

  async getById(id: string) {
    return trainingmethodologyRepository.findById(id);
  }

  async create(data: Partial<ITrainingMethodology>) {
    return trainingmethodologyRepository.create(data);
  }

  async update(id: string, data: Partial<ITrainingMethodology>) {
    return trainingmethodologyRepository.updateById(id, data);
  }

  async delete(id: string) {
    return trainingmethodologyRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return trainingmethodologyRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return trainingmethodologyRepository.count(filter);
  }
}

export default new TrainingMethodologyService();
