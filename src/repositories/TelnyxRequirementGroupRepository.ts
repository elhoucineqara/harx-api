import { BaseRepository } from './BaseRepository';
import TelnyxRequirementGroup, { ITelnyxRequirementGroup } from '../models/TelnyxRequirementGroup';

class TelnyxRequirementGroupRepository extends BaseRepository<ITelnyxRequirementGroup> {
  constructor() {
    super(TelnyxRequirementGroup);
  }
}

export default new TelnyxRequirementGroupRepository();
