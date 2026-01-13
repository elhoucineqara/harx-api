import { Request, Response } from 'express';
import { authenticate } from '../lib/auth-middleware';
import { zohoService } from '../services/zohoService';

export const post = async (req: Request, res: Response) => {
  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = req.body;
    // Assuming companyId is passed or we can derive it. For now, requiring it in body.
    // In a real app, we should probably get the user's company from their profile.
    const { companyId, clientId, clientSecret, refreshToken } = body;

    if (!companyId || !clientId || !clientSecret || !refreshToken) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await zohoService.configure(user.userId, companyId, {
        clientId,
        clientSecret,
        refreshToken
    });

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

