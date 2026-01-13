import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import mime from 'mime';

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'uploads', sanitizedFilename);

    try {
        await fs.access(filePath);
    } catch {
        return res.json({ message: 'File not found' }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const mimeType = mime.getType(filePath) || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
      },
    });
  } catch (error) {
    console.error('View error:', error);
    return res.json({ message: 'Server error' }, { status: 500 });
  }
}



