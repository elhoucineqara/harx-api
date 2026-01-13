import { BaseRepository } from './BaseRepository';
import ManualTraining, { IManualTraining } from '../models/ManualTraining';

class ManualTrainingRepository extends BaseRepository<any> {
  constructor() {
    super(ManualTraining);
  }
}

export default new ManualTrainingRepository();
