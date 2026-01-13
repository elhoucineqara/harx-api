import { Request, Response } from 'express';
const { AnalyticsService } = require('../services/AnalyticsService');

const analyticsService = new AnalyticsService();

// @desc    Get overview analytics
// @route   GET /api/analytics/overview
// @access  Private
export const getOverview = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getOverview();

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get call metrics
// @route   GET /api/analytics/calls
// @access  Private
export const getCallMetrics = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getCallMetrics();

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get agent metrics
// @route   GET /api/analytics/agents
// @access  Private
export const getAgentMetrics = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getAgentMetrics();

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get quality metrics
// @route   GET /api/analytics/quality
// @access  Private
export const getQualityMetrics = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getQualityMetrics();

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};