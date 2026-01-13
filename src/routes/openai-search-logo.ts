import { Request, Response } from 'express';
import openaiService from '../services/openaiService';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { companyName, companyWebsite } = body;
    const result = await openaiService.searchCompanyLogo(companyName, companyWebsite);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}



