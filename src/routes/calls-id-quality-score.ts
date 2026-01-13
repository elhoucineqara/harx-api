import { Request, Response } from 'express';
import { authenticate } from '@/lib/auth-middleware';
import { callService } from '@/services/calls/callService';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = authenticate(req);
  if (!user) {
    return res.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = req.body;
    const { score } = body;
    
    const call = await callService.updateQualityScore(id, score);

    if (!call) {
      return res.json({ success: false, error: 'Call not found' }, { status: 404 });
    }

    return res.json({
      success: true,
      data: call
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

