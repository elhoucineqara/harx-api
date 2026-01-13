import { Request, Response } from 'express';
import { authenticate } from '@/lib/auth-middleware';
import fileService from '@/services/fileService';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req);
  if (!user) {
    return res.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const file = await fileService.togglePublicAccess(id, user.userId);
    return res.json(file);
  } catch (error: any) {
    return res.json({ message: error.message }, { status: 404 });
  }
}



