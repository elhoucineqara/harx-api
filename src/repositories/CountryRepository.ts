import { BaseRepository } from './BaseRepository';
import Country, { ICountry } from '../models/Country';

class CountryRepository extends BaseRepository<ICountry> {
  constructor() {
    super(Country);
  }
}

export default new CountryRepository();
