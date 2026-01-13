import { BaseRepository } from './BaseRepository';
import RequirementGroup, { IRequirementGroup } from '../models/RequirementGroup';

class RequirementGroupRepository extends BaseRepository<IRequirementGroup> {
  constructor() {
    super(RequirementGroup);
  }
}

export default new RequirementGroupRepository();
