import { BaseRepository } from './BaseRepository';
import File, { IFile } from '../models/File';

class FileRepository extends BaseRepository<IFile> {
  constructor() {
    super(File as any);
  }
}

export default new FileRepository();
