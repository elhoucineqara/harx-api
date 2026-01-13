import { BaseRepository } from './BaseRepository';
import TrainingMethodology, { ITrainingMethodology } from '../models/TrainingMethodology';

class TrainingMethodologyRepository extends BaseRepository<any> {
  constructor() {
    super(TrainingMethodology);
  }
}

export default new TrainingMethodologyRepository();
