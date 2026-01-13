import { BaseRepository } from './BaseRepository';
import Document, { IDocument } from '../models/Document';

class DocumentRepository extends BaseRepository<IDocument> {
  constructor() {
    super(Document);
  }
}

export default new DocumentRepository();
