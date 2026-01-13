import { Request, Response } from 'express';
import { callService } from '@/services/calls/callService';

export const post = async (req: Request, res: Response) => {
  // AI Assist might not always be authenticated if called from a webhook or background process, 
  // but for frontend calls it should be.
  // Assuming frontend calls it.
  
  try {
    const body = req.body;
    const { transcription, context } = body;

    const result = await callService.processAIAssist(transcription, context || []);

    return res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

