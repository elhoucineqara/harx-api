import { BaseRepository } from './BaseRepository';
import Call, { ICall } from '../models/Call';

class CallRepository extends BaseRepository<ICall> {
  constructor() {
    super(Call);
  }
}

export default new CallRepository();
