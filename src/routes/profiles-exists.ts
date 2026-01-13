import { Request, Response } from 'express';
import { getUser } from '../middleware/auth';
import { agentService } from '../services/agentService';

export const get = async (req: Request, res: Response) => {
  const user = getUser(req);
  if (!user) {
    // If not authenticated, assume profile doesn't exist? Or return 401?
    // Frontend checkProfileExists handles errors.
    return res.json({ exists: false });
  }

  try {
    const profile = await agentService.getProfile(user.userId);
    return res.json({ exists: !!profile });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
