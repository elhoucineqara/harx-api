import { BaseRepository } from './BaseRepository';
import Agent, { IAgent } from '../models/Agent';

class AgentRepository extends BaseRepository<IAgent> {
  constructor() {
    super(Agent);
  }
}

export default new AgentRepository();
