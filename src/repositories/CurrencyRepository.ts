import { BaseRepository } from './BaseRepository';
import Currency, { ICurrency } from '../models/Currency';

class CurrencyRepository extends BaseRepository<ICurrency> {
  constructor() {
    super(Currency);
  }
}

export default new CurrencyRepository();
