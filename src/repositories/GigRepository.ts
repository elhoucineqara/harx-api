import { BaseRepository } from './BaseRepository';
import Gig, { IGig } from '../models/Gig';

class GigRepository extends BaseRepository<IGig> {
  constructor() {
    super(Gig);
  }
}

export default new GigRepository();
