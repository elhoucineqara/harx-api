import { Request, Response } from 'express';
const { DashboardService } = require('../services/DashboardService');

const dashboardService = new DashboardService();

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
export const getStats = async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getStats();

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

// @desc    Get live calls
// @route   GET /api/dashboard/live-calls
// @access  Private
export const getLiveCalls = async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getLiveCalls();

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

// @desc    Get top performing gigs
// @route   GET /api/dashboard/top-gigs
// @access  Private
export const getTopGigs = async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getTopGigs();

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

// @desc    Get top performing reps
// @route   GET /api/dashboard/top-reps
// @access  Private
export const getTopReps = async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getTopReps();

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