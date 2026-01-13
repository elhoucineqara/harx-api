import { Request, Response } from 'express';
import { authenticate } from '@/lib/auth-middleware';
import { callService } from '@/services/calls/callService';

export const post = async (req: Request, res: Response) => {
  const user = authenticate(req);
  if (!user) {
    return res.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = req.body;
    const { storeCall } = body;
    
    // Mapping frontend data to backend model
    const callData = {
        sid: storeCall.call_id,
        agent: storeCall.caller,
        // lead: storeCall.id_lead, // TODO: Resolve lead ID correctly if needed
        status: 'active',
        direction: 'outbound',
        createdAt: new Date(),
        phone_number: '0000000000' // Placeholder if not provided
    };

    const call = await callService.storeCall(callData);

    if (!call) {
      return res.json({ success: false, error: 'Failed to store call' }, { status: 500 });
    }

    // Cast call to any to avoid complex type issues with Mongoose unions
    const callDataResponse = call as any;

    return res.json({
      success: true,
      _id: callDataResponse._id,
      data: callDataResponse
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

