import { BaseRepository } from './BaseRepository';
import GigMatchingWeight, { IGigMatchingWeight } from '../models/GigMatchingWeight';

class GigMatchingWeightRepository extends BaseRepository<IGigMatchingWeight> {
  constructor() {
    super(GigMatchingWeight);
  }
}

export default new GigMatchingWeightRepository();
