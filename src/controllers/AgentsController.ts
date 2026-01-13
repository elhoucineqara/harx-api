import { Request, Response } from 'express';
const { AgentService } = require('../services/AgentService');

const agentService = new AgentService();

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private
export const getAgents = async (req: Request, res: Response) => {
  try {
    const agents = await agentService.getAllAgents();

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Private
export const getAgent = async (req: Request, res: Response) => {
  try {
    const agent = await agentService.getAgentById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create new agent
// @route   POST /api/agents
// @access  Private
export const createAgent = async (req: Request, res: Response) => {
  try {
    const agent = await agentService.createAgent(req.user._id, req.body);

    res.status(201).json({
      success: true,
      data: agent
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private
export const updateAgent = async (req: Request, res: Response) => {
  try {
    const agent = await agentService.updateAgent(req.params.id, req.body);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private
export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const agent = await agentService.deleteAgent(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update agent availability
// @route   PUT /api/agents/:id/availability
// @access  Private
export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const agent = await agentService.updateAvailability(req.params.id, req.body);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update agent skills
// @route   PUT /api/agents/:id/skills
// @access  Private
export const updateSkills = async (req: Request, res: Response) => {
  try {
    const agent = await agentService.updateSkills(req.params.id, req.body.skills);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};