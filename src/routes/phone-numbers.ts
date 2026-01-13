import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import mongoose from 'mongoose';
import PhoneNumber from '../models/PhoneNumber';
import { phoneNumberSearchService } from '../services/phoneNumberSearchService';

const router = Router();

// IMPORTANT: Specific routes must be defined BEFORE parameterized routes
// Otherwise Express will match /search as /:gigId with gigId="search"

// Search routes (must be before /:gigId)
router.get('/search/twilio', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const searchParams = req.query;
    const countryCode = (searchParams.countryCode || searchParams.country) as string;
    const limit = parseInt(searchParams.limit as string) || 10;
    
    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    console.log(`🔍 Searching Twilio phone numbers for ${countryCode}`);
    
    const numbers = await phoneNumberSearchService.searchTwilioNumbers(countryCode, limit);
    
    return res.json({
      success: true,
      data: numbers,
      count: numbers.length,
      provider: 'twilio',
      countryCode
    });
  } catch (error: any) {
    console.error('❌ Error searching Twilio numbers:', error);
    
    // If it's an authentication error, return empty array instead of 500
    // This allows the frontend to gracefully fall back to Telnyx
    if (error.message?.includes('authentication failed') || 
        error.message?.includes('401') ||
        error.message?.includes('Authenticate')) {
      console.warn('⚠️ Twilio authentication failed, returning empty array');
      return res.json({
        success: true,
        data: [],
        count: 0,
        provider: 'twilio',
        countryCode: req.query.countryCode || req.query.country,
        error: 'Twilio authentication failed. Please check your credentials or use Telnyx instead.'
      });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to search Twilio phone numbers',
      success: false
    });
  }
});

router.get('/search/telnyx', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const searchParams = req.query;
    const countryCode = (searchParams.countryCode || searchParams.country) as string;
    const limit = parseInt(searchParams.limit as string) || 10;
    
    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    console.log(`🔍 Searching Telnyx phone numbers for ${countryCode}`);
    
    const numbers = await phoneNumberSearchService.searchTelnyxNumbers(countryCode, limit);
    
    return res.json({
      success: true,
      data: numbers,
      count: numbers.length,
      provider: 'telnyx',
      countryCode
    });
  } catch (error: any) {
    console.error('❌ Error searching Telnyx numbers:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to search Telnyx phone numbers',
      success: false
    });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const searchParams = req.query;
    const countryCode = (searchParams.countryCode || searchParams.country) as string;
    const provider = (searchParams.provider || 'telnyx') as 'twilio' | 'telnyx';
    const limit = parseInt(searchParams.limit as string) || 10;
    
    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    console.log(`🔍 Searching ${provider} phone numbers for ${countryCode}`);
    
    let numbers;
    if (provider === 'twilio') {
      numbers = await phoneNumberSearchService.searchTwilioNumbers(countryCode, limit);
    } else {
      numbers = await phoneNumberSearchService.searchTelnyxNumbers(countryCode, limit);
    }
    
    return res.json({
      success: true,
      data: numbers,
      count: numbers.length,
      provider,
      countryCode
    });
  } catch (error: any) {
    console.error(`❌ Error searching ${req.query.provider || 'telnyx'} numbers:`, error);
    return res.status(500).json({ 
      error: error.message || 'Failed to search phone numbers',
      success: false
    });
  }
});

// Check if a gig has a phone number
router.get('/gig/:gigId/check', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const { gigId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(200).json({ hasNumber: false, number: null });
    }

    // Check for any phone number with active, pending, or success status (same logic as purchase route)
    const phoneNumber = await PhoneNumber.findOne({ 
      gigId: new mongoose.Types.ObjectId(gigId),
      status: { $in: ['active', 'pending', 'success'] }
    });
    
    if (!phoneNumber) {
      return res.status(200).json({ hasNumber: false, number: null });
    }

    return res.json({ 
      hasNumber: true, 
      number: {
        phoneNumber: phoneNumber.phoneNumber,
        status: phoneNumber.status,
        features: phoneNumber.features || { voice: true, sms: true, mms: true },
        provider: phoneNumber.provider || 'twilio'
      }
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/purchase', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { phoneNumber, provider, gigId, companyId, requirementGroupId } = req.body;
    
    // Validation des champs obligatoires
    const missingFields = {
      phoneNumber: !phoneNumber ? 'Phone number is required' : null,
      provider: !provider ? 'Provider is required' : null,
      gigId: !gigId ? 'Gig ID is required' : null,
      companyId: !companyId ? 'Company ID is required' : null,
      requirementGroupId: provider === 'telnyx' && !requirementGroupId ? 'Requirement group ID is required for Telnyx' : null
    };

    const missingFieldsList = Object.entries(missingFields)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => ({ field: key, message: value }));

    if (missingFieldsList.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: missingFieldsList
      });
    }

    // Validate provider
    if (!['telnyx', 'twilio'].includes(provider)) {
      return res.status(400).json({
        error: 'Invalid provider',
        details: 'Provider must be either "telnyx" or "twilio"'
      });
    }

    // Check if gig already has a phone number
    const existingNumber = await PhoneNumber.findOne({ 
      gigId: new mongoose.Types.ObjectId(gigId),
      status: { $in: ['active', 'pending', 'success'] }
    });
    
    if (existingNumber) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'This gig already has a phone number assigned'
      });
    }

    console.log(`🛒 Purchasing ${provider} number: ${phoneNumber} for gig: ${gigId}`);
    
    const newNumber = await phoneNumberSearchService.purchaseNumber(
      phoneNumber,
      provider,
      gigId,
      requirementGroupId,
      companyId
    );

    return res.json({
      success: true,
      data: newNumber
    });

  } catch (error: any) {
    console.error('❌ Error purchasing phone number:', error);

    // Handle specific error cases
    if (error.message?.includes('already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message
      });
    }

    if (error.message?.includes('Insufficient balance') || error.message?.includes('insufficient')) {
      return res.status(402).json({
        error: 'Payment Required',
        message: error.message
      });
    }

    if (error.message?.includes('no longer available') || error.message?.includes('not available')) {
      return res.status(410).json({
        error: 'Gone',
        message: error.message
      });
    }

    if (error.message?.includes('authentication failed')) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: error.message
      });
    }

    // Generic error handler
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to purchase phone number'
    });
  }
});

// Purchase Twilio number (specific endpoint)
router.post('/purchase/twilio', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { phoneNumber, gigId, companyId } = req.body;

    if (!phoneNumber || !gigId || !companyId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          phoneNumber: !phoneNumber ? 'Phone number is required' : null,
          gigId: !gigId ? 'Gig ID is required' : null,
          companyId: !companyId ? 'Company ID is required' : null
        }
      });
    }

    // Check if gig already has a phone number
    const existingNumber = await PhoneNumber.findOne({ 
      gigId: new mongoose.Types.ObjectId(gigId),
      status: { $in: ['active', 'pending', 'success'] }
    });
    
    if (existingNumber) {
      return res.status(400).json({ 
        error: 'This gig already has a phone number assigned'
      });
    }

    console.log(`🛒 Purchasing Twilio number: ${phoneNumber} for gig: ${gigId}`);
    
    const newNumber = await phoneNumberSearchService.purchaseTwilioNumber(
      phoneNumber,
      gigId,
      companyId
    );

    return res.json({
      success: true,
      data: newNumber
    });
  } catch (error: any) {
    console.error('❌ Error purchasing Twilio phone number:', error);
    
    if (error.message?.includes('authentication failed')) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: error.message
      });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to purchase Twilio phone number'
    });
  }
});

// Parameterized routes (must be AFTER specific routes)
router.get('/:gigId', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    // Await params (Next.js 15+ requirement)
    const { gigId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(200).json({ hasNumber: false, phoneNumber: null });
    }

    // Check for any phone number with active, pending, or success status (same logic as purchase route)
    const phoneNumber = await PhoneNumber.findOne({ 
      gigId: new mongoose.Types.ObjectId(gigId),
      status: { $in: ['active', 'pending', 'success'] }
    });
    
    if (!phoneNumber) {
      return res.status(200).json({ hasNumber: false, phoneNumber: null });
    }

    return res.json({ hasNumber: true, phoneNumber: phoneNumber.phoneNumber });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
