import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { agentService } from '../services/agentService';

const router = Router({ mergeParams: true });

// GET /:id
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Original behavior note: GET /:id ignores ID and returns profile for logged in user
    // per the original code's intent: agentService.getProfile(user.userId)
    const profile = await agentService.getProfile(req.user.userId);
    return res.json(profile);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /:id
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const body = req.body;
    
    // Update by Agent ID
    const profile = await agentService.updateProfile(id, body);
    return res.json(profile);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /:id
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await agentService.deleteProfile(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

