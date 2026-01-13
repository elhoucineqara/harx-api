import { BaseRepository } from './BaseRepository';
import Lead, { ILead } from '../models/Lead';

class LeadRepository extends BaseRepository<ILead> {
  constructor() {
    super(Lead);
  }
}

export default new LeadRepository();
