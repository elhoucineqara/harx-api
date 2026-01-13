import { BaseRepository } from './BaseRepository';
import RepProgress, { IRepProgress } from '../models/RepProgress';

class RepProgressRepository extends BaseRepository<IRepProgress> {
  constructor() {
    super(RepProgress);
  }
}

export default new RepProgressRepository();
