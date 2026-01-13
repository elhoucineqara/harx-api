import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import GigMatchingWeight from '@/models/GigMatchingWeight';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id: gigId } = await params;

  try {
    const weights = await GigMatchingWeight.findOne({ gigId });

    if (!weights) {
      return res.json({ success: false, message: 'Weights not found' }, { status: 404 });
    }

    return res.json({ success: true, data: weights });
  } catch (error: any) {
    console.error('Error fetching gig weights:', error);
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id: gigId } = await params;

  try {
    const body = req.body;
    const { matchingWeights } = body;

    const weights = await GigMatchingWeight.findOneAndUpdate(
      { gigId },
      { matchingWeights },
      { new: true, upsert: true }
    );

    return res.json({ success: true, data: weights });
  } catch (error: any) {
    console.error('Error saving gig weights:', error);
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id: gigId } = await params;

  try {
    await GigMatchingWeight.findOneAndDelete({ gigId });
    return res.json({ success: true, message: 'Weights reset successfully' });
  } catch (error: any) {
    console.error('Error resetting gig weights:', error);
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}


