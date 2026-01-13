import { BaseRepository } from './BaseRepository';
import WhatsAppIntegration, { IWhatsAppIntegration } from '../models/WhatsAppIntegration';

class WhatsAppIntegrationRepository extends BaseRepository<IWhatsAppIntegration> {
  constructor() {
    super(WhatsAppIntegration);
  }
}

export default new WhatsAppIntegrationRepository();
