import { Request, Response } from 'express';
import { authenticate } from '../../../../lib/auth-middleware';
import fileService from '../../../../services/fileService';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export const post = async (req: Request, res: Response) => {
  const user = authenticate(req);
  if (!user) {
    return res.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const metadataString = formData.get('metadata') as string | null;

    if (!file) {
      return res.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    const filename = uniqueSuffix + '-' + file.name;
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Ensure upload directory exists
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    // Store relative path in DB
    const relativePath = `uploads/${filename}`;

    const fileData = {
        originalname: file.name,
        size: file.size,
        mimetype: file.type,
        path: relativePath
    };

    let metadata = {};
    if (metadataString) {
        try {
            metadata = JSON.parse(metadataString);
        } catch (e) {
            console.error('Failed to parse metadata', e);
        }
    }

    const savedFile = await fileService.uploadFile(fileData, user.userId, metadata);
    return res.json(savedFile, { status: 201 });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.json({ message: 'Server error' }, { status: 500 });
  }
}
