import manualtrainingRepository from '../repositories/ManualTrainingRepository';
import { IManualTraining } from '../models/ManualTraining';

class ManualTrainingService {
  async getAll() {
    return manualtrainingRepository.find();
  }

  async getById(id: string) {
    return manualtrainingRepository.findById(id);
  }

  async create(data: Partial<IManualTraining>) {
    return manualtrainingRepository.create(data);
  }

  async update(id: string, data: Partial<IManualTraining>) {
    return manualtrainingRepository.updateById(id, data);
  }

  async delete(id: string) {
    return manualtrainingRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return manualtrainingRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return manualtrainingRepository.count(filter);
  }
}

export default new ManualTrainingService();
