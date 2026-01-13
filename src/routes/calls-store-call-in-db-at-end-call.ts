import { Request, Response } from 'express';
import { authenticate } from '@/lib/auth-middleware';
import { callService } from '@/services/calls/callService';
import Call from '@/models/Call';
import dbConnect from '@/lib/db/mongodb';

export const post = async (req: Request, res: Response) => {
  const user = authenticate(req);
  if (!user) {
    return res.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = req.body;
    const { phoneNumber, callSid } = body;
    
    await dbConnect();
    
    // Find call by SID and update
    let call = await Call.findOne({ sid: callSid });
    
    if (call) {
        call.status = 'completed';
        call.updatedAt = new Date();
        await call.save();
    } else {
        // If not found (maybe not created at start), create it
        // Note: This logic depends on how consistent the SID is between start/end
        console.warn(`Call with SID ${callSid} not found at end call, creating new record.`);
        call = await Call.create({
            sid: callSid,
            agent: user.userId,
            phone_number: phoneNumber,
            direction: 'outbound',
            status: 'completed'
        });
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

