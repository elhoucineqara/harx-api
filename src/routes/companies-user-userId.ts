import { Request, Response } from 'express';
import companyService from '@/services/companyService';
import { authenticate } from '@/lib/auth-middleware';

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = authenticate(req);
  if (!user) {
    return res.json({ 
      error: 'Unauthorized',
      message: 'Authentication failed. Please check your token or log in again.'
    }, { status: 401 });
  }

  try {
    const company = await companyService.getCompanyByUserId(userId);
    if (!company) {
      return res.json({ success: false, message: 'Company not found for this user' }, { status: 404 });
    }
    return res.json({ success: true, data: company });
  } catch (error: any) {
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}
