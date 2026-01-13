import requirementgroupRepository from '../repositories/RequirementGroupRepository';
import { IRequirementGroup } from '../models/RequirementGroup';

class RequirementGroupService {
  async getAll() {
    return requirementgroupRepository.find();
  }

  async getById(id: string) {
    return requirementgroupRepository.findById(id);
  }

  async create(data: Partial<IRequirementGroup>) {
    return requirementgroupRepository.create(data);
  }

  async update(id: string, data: Partial<IRequirementGroup>) {
    return requirementgroupRepository.updateById(id, data);
  }

  async delete(id: string) {
    return requirementgroupRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return requirementgroupRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return requirementgroupRepository.count(filter);
  }
}

export default new RequirementGroupService();
