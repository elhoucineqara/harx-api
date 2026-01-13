import { Request, Response } from 'express';
import { Integration } from '../models/Integration';

// @desc    Get all integrations
// @route   GET /api/integrations
// @access  Private
export const getIntegrations = async (req: Request, res: Response) => {
  try {
    const integrations = await Integration.find();
    
    res.status(200).json({
      success: true,
      data: integrations
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single integration
// @route   GET /api/integrations/:id
// @access  Private
export const getIntegration = async (req: Request, res: Response) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: integration
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Connect integration
// @route   POST /api/integrations/:id/connect
// @access  Private
export const connectIntegration = async (req: Request, res: Response) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    integration.status = 'connected';
    await integration.save();

    res.status(200).json({
      success: true,
      data: integration
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Disconnect integration
// @route   POST /api/integrations/:id/disconnect
// @access  Private
export const disconnectIntegration = async (req: Request, res: Response) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    integration.status = 'pending';
    await integration.save();

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

// @desc    Configure integration
// @route   POST /api/integrations/:id/configure
// @access  Private
export const configureIntegration = async (req: Request, res: Response) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    integration.config = req.body;
    await integration.save();

    res.status(200).json({
      success: true,
      data: integration
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};