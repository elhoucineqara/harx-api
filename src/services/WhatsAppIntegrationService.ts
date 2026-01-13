import whatsappintegrationRepository from '../repositories/WhatsAppIntegrationRepository';
import { IWhatsAppIntegration } from '../models/WhatsAppIntegration';

class WhatsAppIntegrationService {
  async getAll() {
    return whatsappintegrationRepository.find();
  }

  async getById(id: string) {
    return whatsappintegrationRepository.findById(id);
  }

  async create(data: Partial<IWhatsAppIntegration>) {
    return whatsappintegrationRepository.create(data);
  }

  async update(id: string, data: Partial<IWhatsAppIntegration>) {
    return whatsappintegrationRepository.updateById(id, data);
  }

  async delete(id: string) {
    return whatsappintegrationRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return whatsappintegrationRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return whatsappintegrationRepository.count(filter);
  }
}

export default new WhatsAppIntegrationService();
