import { BaseRepository } from './BaseRepository';
import Analysis, { IAnalysis } from '../models/Analysis';

class AnalysisRepository extends BaseRepository<IAnalysis> {
  constructor() {
    super(Analysis);
  }
}

export default new AnalysisRepository();
