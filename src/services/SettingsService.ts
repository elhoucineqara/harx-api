import { SettingsRepository } from '../repositories/SettingsRepository';

class SettingsService {
  private repository: SettingsRepository;
  
  constructor() {
    this.repository = new SettingsRepository();
  }

  async getSettings() {
    return this.repository.findOrCreate();
  }

  async updateSettings(data: any) {
    const settings = await this.repository.findOrCreate();
    return this.repository.update(settings._id, data);
  }

  async updateLogo(logo: string) {
    return this.repository.updateLogo(logo);
  }
}

export { SettingsService };
