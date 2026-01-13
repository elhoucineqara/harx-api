import { Request, Response } from 'express';
import onboardingprogressService from '../services/onboardingProgressService';

export class OnboardingProgressController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await onboardingprogressService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await onboardingprogressService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'OnboardingProgress not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await onboardingprogressService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await onboardingprogressService.update(id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'OnboardingProgress not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await onboardingprogressService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'OnboardingProgress not found' });
      }
      return res.json({ success: true, message: 'OnboardingProgress deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getProgressByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const progress = await onboardingprogressService.getProgressByUserId(userId);
      return res.json({ success: true, data: progress });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async initializeProgress(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const progress = await onboardingprogressService.initializeProgress(companyId);
      return res.status(201).json({ success: true, data: progress });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getProgress(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const progress = await onboardingprogressService.getProgress(companyId);
      return res.json({ success: true, data: progress });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateStepProgress(req: Request, res: Response) {
    try {
      const { companyId, phaseId, stepId } = req.params;
      const { status } = req.body;
      const progress = await onboardingprogressService.updateStepProgress(companyId, parseInt(phaseId), parseInt(stepId), status);
      return res.json({ success: true, data: progress });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateCurrentPhase(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { phase } = req.body;
      const progress = await onboardingprogressService.updateCurrentPhase(companyId, parseInt(phase));
      return res.json({ success: true, data: progress });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async resetProgress(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const progress = await onboardingprogressService.resetProgress(companyId);
      return res.json({ success: true, data: progress });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async completeLastPhaseAndStep(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const progress = await onboardingprogressService.completeLastPhaseAndStep(companyId);
      return res.json({ success: true, data: progress });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async fixCurrentPhase(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const progress = await onboardingprogressService.fixCurrentPhase(companyId);
      return res.json({ success: true, data: progress });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new OnboardingProgressController();
