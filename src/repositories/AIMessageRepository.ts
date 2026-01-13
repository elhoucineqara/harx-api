import { BaseRepository } from './BaseRepository';
import AIMessage, { IAIMessage } from '../models/AIMessage';

class AIMessageRepository extends BaseRepository<IAIMessage> {
  constructor() {
    super(AIMessage);
  }
}

export default new AIMessageRepository();
