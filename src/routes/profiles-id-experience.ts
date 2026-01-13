import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { agentService } from '../services/agentService';

export const updateExperience = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const body = req.body;
    
    // Body is expected to be { experience: [...] }
    const profile = await agentService.updateProfile(id, { experience: body.experience });
    return res.json(profile);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

