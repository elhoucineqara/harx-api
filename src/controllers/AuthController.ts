import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import authService from '../services/authService';
import dbConnect from '../lib/dbConnect';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide fullName, email, password, and phone'
      });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone
    });

    // Generate token
    const token = authService.generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Use authService.login which generates verification code
    const result = await authService.login(email, password, req);
    
    // Generate token (we need to get the user to generate token)
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = authService.generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        typeUser: user.typeUser,
        code: result.verificationCode // Include verification code in response
      }
    });
  } catch (err: any) {
    // Return 401 for invalid credentials (user not found or wrong password)
    // This is more semantically correct than 400
    const statusCode = err.message === 'Invalid credentials' ? 401 : 400;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Invalid credentials'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user?.userId || (req as any).user?.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token
  });
};

// Additional auth functions using authService
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyEmail(email, code);
    res.status(200).json({ success: true, token: result.token, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const linkedInAuth = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const result = await authService.linkedInAuth(code);
    res.status(200).json({ success: true, token: result.token, user: result.user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { userId, phoneNumber } = req.body;
    const result = await authService.sendOTPWithTwilio(userId, phoneNumber);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;
    const result = await authService.verifyOTPTwilio(userId, otp);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const result = await authService.verifyAccount(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const generateVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.generateVerificationCodeForRecovery(email);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    const result = await authService.changePassword(email, newPassword);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const linkedinSignIn = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const result = await authService.linkedinSignIn(code);
    res.status(200).json({ success: true, token: result.token, user: result.user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const sendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const result = await authService.sendVerificationEmail(email, code);
    // Le service retourne déjà un objet avec success, code, devMode, etc.
    // On le retourne directement sans l'envelopper
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const checkFirstLogin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    
    const result = await authService.checkFirstLogin(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    // Return 404 if user not found, 400 for other errors
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

export const changeUserType = async (req: Request, res: Response) => {
  try {
    const { userId, newType } = req.body;
    const result = await authService.changeUserType(userId, newType);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const checkUserType = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    
    const result = await authService.checkUserType(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    // Return 404 if user not found, 400 for other errors
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};