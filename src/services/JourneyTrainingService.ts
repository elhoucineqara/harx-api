import journeytrainingRepository from '../repositories/JourneyTrainingRepository';
import { IJourneyTraining } from '../models/JourneyTraining';

class JourneyTrainingService {
  async getAll() {
    return journeytrainingRepository.find();
  }

  async getById(id: string) {
    return journeytrainingRepository.findById(id);
  }

  async create(data: Partial<IJourneyTraining>) {
    return journeytrainingRepository.create(data);
  }

  async update(id: string, data: Partial<IJourneyTraining>) {
    return journeytrainingRepository.updateById(id, data);
  }

  async delete(id: string) {
    return journeytrainingRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return journeytrainingRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return journeytrainingRepository.count(filter);
  }
}

export default new JourneyTrainingService();
