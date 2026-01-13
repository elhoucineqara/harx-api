import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;

  try {
    await File.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Document deleted' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}


