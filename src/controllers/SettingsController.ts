import { Request, Response } from 'express';
const { SettingsService } = require('../services/SettingsService');

const settingsService = new SettingsService();

// @desc    Get settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getSettings();
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.updateSettings(req.body);

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update company logo
// @route   PUT /api/settings/logo
// @access  Private
export const updateLogo = async (req: Request, res: Response) => {
  try {
    const { logo } = req.body;
    const settings = await settingsService.updateLogo(logo);

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};