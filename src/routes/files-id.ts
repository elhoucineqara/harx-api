import { Request, Response } from 'express';
import { authenticate } from '../../../../lib/auth-middleware';
import fileService from '../../../../services/fileService';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req);
  if (!user) {
    return res.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await fileService.deleteFile(id, user.userId);
    return res.json(result);
  } catch (error: any) {
    return res.json({ message: error.message }, { status: 404 });
  }
}



