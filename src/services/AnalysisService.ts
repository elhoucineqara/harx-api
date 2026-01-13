import analysisRepository from '../repositories/AnalysisRepository';
import { IAnalysis } from '../models/Analysis';

class AnalysisService {
  async getAll() {
    return analysisRepository.find();
  }

  async getById(id: string) {
    return analysisRepository.findById(id);
  }

  async create(data: Partial<IAnalysis>) {
    return analysisRepository.create(data);
  }

  async update(id: string, data: Partial<IAnalysis>) {
    return analysisRepository.updateById(id, data);
  }

  async delete(id: string) {
    return analysisRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return analysisRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return analysisRepository.count(filter);
  }
}

export default new AnalysisService();
