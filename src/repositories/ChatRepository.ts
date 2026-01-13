import { BaseRepository } from './BaseRepository';
import Chat, { IChat } from '../models/Chat';

class ChatRepository extends BaseRepository<IChat> {
  constructor() {
    super(Chat);
  }
}

export default new ChatRepository();
