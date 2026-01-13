import { BaseRepository } from './BaseRepository';
import User, { IUser } from '../models/User';

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User as any);
  }
}

export default new UserRepository();
