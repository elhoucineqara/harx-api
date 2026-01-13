import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import openaiService from '../services/openaiService';

const router = Router();

router.post('/generate-profile', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const body = req.body;
    const { companyInfo, userId } = body;
    
    console.log('[API] Generate profile request:', {
      userId,
      companyInfoLength: companyInfo?.length,
      companyInfoPreview: companyInfo?.substring(0, 200),
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });

    const profile = await openaiService.generateCompanyProfile(companyInfo, userId);
    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});


router.post('/generate-uniqueness', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const body = req.body;
    const { profile } = body;

    console.log('[API] Generate uniqueness categories request:', {
      companyName: profile?.name,
      industry: profile?.industry,
      hasProfile: !!profile
    });

    const categories = await openaiService.generateUniquenessCategories(profile);
    return res.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});


router.post('/search-logo', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const body = req.body;
    const { companyName, companyWebsite } = body;
    const result = await openaiService.searchCompanyLogo(companyName, companyWebsite);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});


export default router;
