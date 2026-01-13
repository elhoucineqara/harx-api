import callrecordingRepository from '../repositories/CallRecordingRepository';
import { ICallRecording } from '../models/CallRecording';

class CallRecordingService {
  async getAll() {
    return callrecordingRepository.find();
  }

  async getById(id: string) {
    return callrecordingRepository.findById(id);
  }

  async create(data: Partial<ICallRecording>) {
    return callrecordingRepository.create(data);
  }

  async update(id: string, data: Partial<ICallRecording>) {
    return callrecordingRepository.updateById(id, data);
  }

  async delete(id: string) {
    return callrecordingRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return callrecordingRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return callrecordingRepository.count(filter);
  }
}

export default new CallRecordingService();
