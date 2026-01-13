import timezoneRepository from '../repositories/TimezoneRepository';
import { ITimezone } from '../models/Timezone';

class TimezoneService {
  async getAll() {
    return timezoneRepository.find();
  }

  async getAllTimezones() {
    return timezoneRepository.find();
  }

  async searchTimezones(query: string) {
    const searchRegex = new RegExp(query, 'i');
    return timezoneRepository.find({
      $or: [
        { zoneName: searchRegex },
        { countryName: searchRegex },
        { countryCode: searchRegex }
      ]
    });
  }

  async getCountriesWithNames() {
    const timezones = await timezoneRepository.find();
    const countries = new Map();
    
    timezones.forEach(tz => {
      if (!countries.has(tz.countryCode)) {
        countries.set(tz.countryCode, tz.countryName);
      }
    });

    return Array.from(countries.entries()).map(([code, name]) => ({
      code,
      name
    }));
  }

  async getTimezonesByCountry(countryCode: string) {
    return timezoneRepository.find({ countryCode: countryCode.toUpperCase() });
  }

  async getTimezoneByZone(zoneName: string) {
    return timezoneRepository.findOne({ zoneName });
  }

  async getById(id: string) {
    return timezoneRepository.findById(id);
  }

  async create(data: Partial<ITimezone>) {
    return timezoneRepository.create(data);
  }

  async update(id: string, data: Partial<ITimezone>) {
    return timezoneRepository.updateById(id, data);
  }

  async delete(id: string) {
    return timezoneRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return timezoneRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return timezoneRepository.count(filter);
  }
}

export default new TimezoneService();
