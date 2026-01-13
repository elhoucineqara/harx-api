import { BaseRepository } from './BaseRepository';
import OnboardingProgress, { IOnboardingProgress } from '../models/OnboardingProgress';

class OnboardingProgressRepository extends BaseRepository<IOnboardingProgress> {
  constructor() {
    super(OnboardingProgress);
  }
}

export default new OnboardingProgressRepository();
