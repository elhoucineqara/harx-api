import { BaseRepository } from './BaseRepository';
import GigAgent, { IGigAgent } from '../models/GigAgent';

class GigAgentRepository extends BaseRepository<IGigAgent> {
  constructor() {
    super(GigAgent);
  }
}

export default new GigAgentRepository();
