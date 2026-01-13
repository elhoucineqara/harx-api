import fs from 'fs/promises';
import File from '../models/File';
import dbConnect from '../lib/dbConnect';

class FileService {
  async uploadFile(file: { originalname: string; size: number; mimetype: string; path: string }, userId: string, metadata = {}) {
    await dbConnect();
    if (!file) {
      throw new Error('No file provided');
    }

    return File.create({
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      path: file.path,
      uploadedBy: userId,
      metadata
    });
  }

  async getFiles(userId: string, page = 1, limit = 10) {
    await dbConnect();
    const skip = (page - 1) * limit;
    return File.find({ uploadedBy: userId }).skip(skip).limit(limit);
  }

  async deleteFile(fileId: string, userId: string) {
    await dbConnect();
    const file = await File.findOne({
      _id: fileId,
      uploadedBy: userId
    });

    if (!file) {
      throw new Error('File not found');
    }

    try {
        await fs.unlink(file.path);
    } catch (e) {
        console.warn(`File on disk not found: ${file.path}`);
    }
    
    await File.deleteOne({ _id: fileId });

    return { message: 'File deleted successfully' };
  }

  async togglePublicAccess(fileId: string, userId: string) {
    await dbConnect();
    const file = await File.findOne({
      _id: fileId,
      uploadedBy: userId
    });

    if (!file) {
      throw new Error('File not found');
    }

    file.isPublic = !file.isPublic;
    await file.save();
    return file;
  }

  async exportFiles(userId: string) {
    await dbConnect();
    const files = await File.find({ uploadedBy: userId });

    const exportData = files.map(file => ({
      id: file._id,
      name: file.name,
      size: file.size,
      type: file.type,
      isPublic: file.isPublic,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      metadata: file.metadata
    }));

    return {
      exportedAt: new Date(),
      totalFiles: files.length,
      files: exportData
    };
  }

  async getAll() {
    await dbConnect();
    return File.find();
  }

  async getById(id: string) {
    await dbConnect();
    return File.findById(id);
  }

  async create(data: any) {
    await dbConnect();
    return File.create(data);
  }

  async update(id: string, data: any) {
    await dbConnect();
    return File.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    await dbConnect();
    const file = await File.findById(id);
    if (!file) {
      throw new Error('File not found');
    }
    return this.deleteFile(id, file.uploadedBy.toString());
  }
}

export default new FileService();



