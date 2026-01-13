import { BaseRepository } from './BaseRepository';
import Timezone, { ITimezone } from '../models/Timezone';

class TimezoneRepository extends BaseRepository<ITimezone> {
  constructor() {
    super(Timezone);
  }
}

export default new TimezoneRepository();
