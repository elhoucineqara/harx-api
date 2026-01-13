import { BaseRepository } from './BaseRepository';
import Industry, { IIndustry } from '../models/Industry';

class IndustryRepository extends BaseRepository<IIndustry> {
  constructor() {
    super(Industry);
  }
}

export default new IndustryRepository();
