import { BaseRepository } from './BaseRepository';
import Settings from '../models/Settings';

export class SettingsRepository extends BaseRepository<any> {
  constructor() {
    super(Settings as any);
  }

  async findOrCreate(data = {}) {
    let settings = await this.model.findOne();
    if (!settings) {
      settings = await this.model.create(data);
    }
    return settings;
  }

  async updateLogo(logo: string) {
    let settings = await this.findOrCreate();
    (settings as any).company.logo = logo;
    return settings.save();
  }
}
