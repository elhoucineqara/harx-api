import documentRepository from '../repositories/DocumentRepository';
import { IDocument } from '../models/Document';

class DocumentService {
  async getAll() {
    return documentRepository.find();
  }

  async getById(id: string) {
    return documentRepository.findById(id);
  }

  async create(data: Partial<IDocument>) {
    return documentRepository.create(data);
  }

  async update(id: string, data: Partial<IDocument>) {
    return documentRepository.updateById(id, data);
  }

  async delete(id: string) {
    return documentRepository.deleteById(id);
  }

  async findOne(filter: any) {
    return documentRepository.findOne(filter);
  }

  async count(filter: any = {}) {
    return documentRepository.count(filter);
  }
}

export default new DocumentService();
