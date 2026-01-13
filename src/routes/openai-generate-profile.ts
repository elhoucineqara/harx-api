import { Request, Response } from 'express';
import openaiService from '../services/openaiService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { companyInfo, userId } = body;
    
    console.log('[API] Generate profile request:', {
      userId,
      companyInfoLength: companyInfo?.length,
      companyInfoPreview: companyInfo?.substring(0, 200),
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });

    if (!companyInfo) {
      console.error('[API] Missing companyInfo in request body');
      return res.status(400).json({ 
        success: false, 
        message: 'Company info is required' 
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('[API] OPENAI_API_KEY is not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'OpenAI API key is not configured' 
      });
    }

    console.log('[API] Calling OpenAI service...');
    const result = await openaiService.generateCompanyProfile(companyInfo, userId);
    console.log('[API] Profile generated successfully:', {
      companyName: result?.name,
      hasData: !!result
    });
    
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Generate profile error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      status: error.status,
      code: error.code
    });
    
    const errorMessage = error.message || 'Failed to generate company profile';
    const statusCode = error.status || 500;
    
    return res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name,
        cause: error.cause
      } : undefined
    });
  }
}



