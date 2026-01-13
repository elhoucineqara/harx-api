import { BaseRepository } from './BaseRepository';
import Match, { IMatch } from '../models/Match';

class MatchRepository extends BaseRepository<IMatch> {
  constructor() {
    super(Match);
  }
}

export default new MatchRepository();
