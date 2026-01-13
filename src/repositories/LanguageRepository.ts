import { BaseRepository } from './BaseRepository';
import Language, { ILanguage } from '../models/Language';

class LanguageRepository extends BaseRepository<ILanguage> {
  constructor() {
    super(Language);
  }
}

export default new LanguageRepository();
