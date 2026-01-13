import { Request, Response } from 'express';
import companyService from '@/services/companyService';
import { authenticate } from '@/lib/auth-middleware';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = authenticate(req);
  if (!user) {
    return res.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const company = await companyService.getCompanyDetails(id);
    if (!company) {
      return res.json({ success: false, message: 'Company details not found' }, { status: 404 });
    }
    return res.json({ success: true, data: company });
  } catch (error: any) {
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}


