import { Request, Response } from 'express';
import { getUser } from '../middleware/auth';
import { agentService } from '../services/agentService';

export async function PUT(req: Request, res: Response) {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const body = req.body;
    // updateBasicInfo is not explicitly in AgentService yet, but updateProfile handles it.
    // However, the original code had a specific method. I should probably add it or just use updateProfile.
    // updateProfile handles partial updates via findByIdAndUpdate.
    const profile = await agentService.updateProfile(id, body);
    return res.json(profile);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

