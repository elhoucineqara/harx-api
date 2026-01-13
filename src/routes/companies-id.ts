import { Request, Response } from 'express';
import companyService from '../../../../services/companyService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const company = await companyService.getCompanyById(id);
    if (!company) {
      return res.json({ success: false, message: 'Company not found' }, { status: 404 });
    }
    return res.json({ success: true, data: company });
  } catch (error: any) {
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = req.body;
    const company = await companyService.updateCompany(id, body);
    if (!company) {
      return res.json({ success: false, message: 'Company not found' }, { status: 404 });
    }
    return res.json({ success: true, data: company });
  } catch (error: any) {
    return res.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const company = await companyService.deleteCompany(id);
    if (!company) {
      return res.json({ success: false, message: 'Company not found' }, { status: 404 });
    }
    return res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error: any) {
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}



