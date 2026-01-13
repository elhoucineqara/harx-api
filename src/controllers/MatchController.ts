import { Request, Response } from 'express';
import matchService from '../services/MatchService';

class MatchController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await matchService.getAll();
      return res.json({ success: true, data: items });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await matchService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Match not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await matchService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await matchService.update(id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Match not found' });
      }
      return res.json({ success: true, data: item });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await matchService.delete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Match not found' });
      }
      return res.json({ success: true, message: 'Match deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async findMatchesForGigById(req: Request, res: Response) {
    try {
      // TODO: Implement logic to find matches for a gig
      // const { id } = req.params;
      // const items = await matchService.findByGigId(id);
      return res.status(501).json({ success: false, message: 'Not implemented' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async findMatchesForAgentById(req: Request, res: Response) {
    try {
      // TODO: Implement logic to find matches for an agent
      // const { id } = req.params;
      // const items = await matchService.findByAgentId(id);
      return res.status(501).json({ success: false, message: 'Not implemented' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async generateOptimalMatches(req: Request, res: Response) {
    try {
      // TODO: Implement logic to generate optimal matches
      return res.status(501).json({ success: false, message: 'Not implemented' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async findLanguageMatchesForGig(req: Request, res: Response) {
    try {
      // TODO: Implement logic to find language matches
      return res.status(501).json({ success: false, message: 'Not implemented' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async createGigAgentFromMatch(req: Request, res: Response) {
    try {
      // TODO: Implement logic to create GigAgent
      return res.status(501).json({ success: false, message: 'Not implemented' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

const matchController = new MatchController();

export const getAllMatches = matchController.getAll.bind(matchController);
export const getMatchById = matchController.getById.bind(matchController);
export const createMatch = matchController.create.bind(matchController);
export const updateMatch = matchController.update.bind(matchController);
export const deleteMatch = matchController.delete.bind(matchController);

export const findMatchesForGigById = matchController.findMatchesForGigById.bind(matchController);
export const findMatchesForAgentById = matchController.findMatchesForAgentById.bind(matchController);
export const generateOptimalMatches = matchController.generateOptimalMatches.bind(matchController);
export const findLanguageMatchesForGig = matchController.findLanguageMatchesForGig.bind(matchController);
export const createGigAgentFromMatch = matchController.createGigAgentFromMatch.bind(matchController);

export default matchController;
