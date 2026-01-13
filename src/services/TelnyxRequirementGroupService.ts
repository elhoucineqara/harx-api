import telnyxrequirementgroupRepository from '../repositories/TelnyxRequirementGroupRepository';
import { ITelnyxRequirementGroup } from '../models/TelnyxRequirementGroup';

class TelnyxRequirementGroupService {
  async getAll(filter: any = {}) {
    return telnyxrequirementgroupRepository.find(filter);
  }

  async getById(id: string) {
    return telnyxrequirementgroupRepository.findById(id);
  }

  async create(data: Partial<ITelnyxRequirementGroup>) {
    return telnyxrequirementgroupRepository.create(data);
  }

  async update(id: string, data: Partial<ITelnyxRequirementGroup>) {
    return telnyxrequirementgroupRepository.updateById(id, data);
  }

  async delete(id: string) {
    return telnyxrequirementgroupRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return telnyxrequirementgroupRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return telnyxrequirementgroupRepository.count(filter);
  }
}

export default new TelnyxRequirementGroupService();
