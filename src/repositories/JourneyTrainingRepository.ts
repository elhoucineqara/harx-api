import { BaseRepository } from './BaseRepository';
import JourneyTraining, { IJourneyTraining } from '../models/JourneyTraining';

class JourneyTrainingRepository extends BaseRepository<IJourneyTraining> {
  constructor() {
    super(JourneyTraining);
  }
}

export default new JourneyTrainingRepository();
