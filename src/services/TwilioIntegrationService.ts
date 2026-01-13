import twiliointegrationRepository from '../repositories/TwilioIntegrationRepository';
import { ITwilioIntegration } from '../models/TwilioIntegration';

class TwilioIntegrationService {
  async getAll() {
    return twiliointegrationRepository.find();
  }

  async getById(id: string) {
    return twiliointegrationRepository.findById(id);
  }

  async create(data: Partial<ITwilioIntegration>) {
    return twiliointegrationRepository.create(data);
  }

  async update(id: string, data: Partial<ITwilioIntegration>) {
    return twiliointegrationRepository.updateById(id, data);
  }

  async delete(id: string) {
    return twiliointegrationRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return twiliointegrationRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return twiliointegrationRepository.count(filter);
  }
}

export default new TwilioIntegrationService();
