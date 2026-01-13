import { BaseRepository } from './BaseRepository';
import PhoneNumber, { IPhoneNumber } from '../models/PhoneNumber';

class PhoneNumberRepository extends BaseRepository<IPhoneNumber> {
  constructor() {
    super(PhoneNumber);
  }
}

export default new PhoneNumberRepository();
