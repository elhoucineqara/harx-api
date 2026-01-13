import { Request, Response } from 'express';
import { authenticate } from '@/lib/auth-middleware';
import { dashboardService } from '@/services/dashboard/dashboardService';

export const get = async (req: Request, res: Response) => {
  const user = authenticate(req);
  if (!user) {
    return res.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await dashboardService.getTopReps();
    return res.json({
      success: true,
      data
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}


