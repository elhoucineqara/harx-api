import { BaseRepository } from './BaseRepository';
import Script, { IScript } from '../models/Script';

class ScriptRepository extends BaseRepository<IScript> {
  constructor() {
    super(Script);
  }
}

export default new ScriptRepository();
