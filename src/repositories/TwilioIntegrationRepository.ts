import { BaseRepository } from './BaseRepository';
import TwilioIntegration, { ITwilioIntegration } from '../models/TwilioIntegration';

class TwilioIntegrationRepository extends BaseRepository<ITwilioIntegration> {
  constructor() {
    super(TwilioIntegration);
  }
}

export default new TwilioIntegrationRepository();
