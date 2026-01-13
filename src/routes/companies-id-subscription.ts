import { Request, Response } from 'express';
import companyService from '@/services/companyService';
import { authenticate } from '@/lib/auth-middleware';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = authenticate(req);
  if (!user) {
    return res.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subscription } = req.body;
    if (!['free', 'standard', 'premium'].includes(subscription)) {
        return res.json({ success: false, message: 'Invalid subscription plan' }, { status: 400 });
    }

    const company = await companyService.updateSubscription(id, subscription);
    if (!company) {
      return res.json({ success: false, message: 'Company not found' }, { status: 404 });
    }
    return res.json({ success: true, data: company });
  } catch (error: any) {
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}


