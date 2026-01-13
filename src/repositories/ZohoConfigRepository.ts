import { BaseRepository } from './BaseRepository';
import ZohoConfig, { IZohoConfig } from '../models/ZohoConfig';

class ZohoConfigRepository extends BaseRepository<IZohoConfig> {
  constructor() {
    super(ZohoConfig);
  }
}

export default new ZohoConfigRepository();
