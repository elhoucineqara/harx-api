import { Request, Response } from 'express';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import mongoose from 'mongoose';

export const post = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { userId, newType } = req.body;

    if (!userId || !newType) {
      return res.json(
        { message: 'User ID and new type are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    user.userType = newType;
    await user.save();

    return res.json({
      success: true,
      message: 'User type updated successfully',
      user: {
        _id: user._id,
        userType: user.userType,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('Error updating user type:', error);
    return res.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
