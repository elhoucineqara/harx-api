import { BaseRepository } from './BaseRepository';
import Company, { ICompany } from '../models/Company';

class CompanyRepository extends BaseRepository<ICompany> {
  constructor() {
    super(Company);
  }
}

export default new CompanyRepository();
