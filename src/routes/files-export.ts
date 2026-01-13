import { Request, Response } from 'express';
import { authenticate } from '../../../../lib/auth-middleware';
import fileService from '../../../../services/fileService';

export const get = async (req: Request, res: Response) => {
  const user = authenticate(req);
  if (!user) {
    return res.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const files = await fileService.exportFiles(user.userId);
    return res.json(files);
  } catch (error: any) {
    return res.json({ message: error.message }, { status: 500 });
  }
}



