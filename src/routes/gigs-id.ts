import { Request, Response } from 'express';
import gigService from '../../../../services/gigService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const gig = await gigService.getGigById(id);
    return res.json({ success: true, data: gig });
  } catch (error: any) {
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = req.body;
    const gig = await gigService.updateGig(id, body);
    return res.json({ success: true, data: gig });
  } catch (error: any) {
    return res.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const gig = await gigService.deleteGig(id);
    return res.json({ success: true, message: 'Gig deleted successfully' });
  } catch (error: any) {
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}



