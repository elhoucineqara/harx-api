import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';

// @desc    Get user details by ID
// @route   GET /api/users/:userId
// @access  Private
export const getUserDetails = async (req: Request, res: Response) => {
    try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Validate if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
      }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        typeUser: user.typeUser,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    console.error('Error in getUserDetails:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred while fetching user details'
    });
    }
};

// @desc    Get user IP history
// @route   GET /api/users/:userId/ip-history
// @access  Private
export const getUserIPHistory = async (req: Request, res: Response) => {
    try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      }

    // Validate if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }

    const user = await User.findById(userId).select('ipHistory');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
      }

    res.status(200).json({
      success: true,
      data: user.ipHistory || []
    });
  } catch (err: any) {
    console.error('Error in getUserIPHistory:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred while fetching user IP history'
    });
  }
};
