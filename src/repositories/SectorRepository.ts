import { BaseRepository } from './BaseRepository';
import Sector, { ISector } from '../models/Sector';

class SectorRepository extends BaseRepository<ISector> {
  constructor() {
    super(Sector);
  }
}

export default new SectorRepository();
