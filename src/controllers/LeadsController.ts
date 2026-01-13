import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Lead from '../models/Lead';

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
export const getLeads = async (req: Request, res: Response) => {
  try {
    const leads = await Lead.find().populate('assignedTo');

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
export const getLead = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo');

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
export const createLead = async (req: Request, res: Response) => {
  try {
    console.log('📝 Creating lead with data:', JSON.stringify(req.body, null, 2));
    
    // Validate ObjectId fields and convert strings to ObjectIds
    const leadData: any = { ...req.body };
    
    if (leadData.userId && typeof leadData.userId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(leadData.userId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid userId format: ${leadData.userId}`
        });
      }
      leadData.userId = new mongoose.Types.ObjectId(leadData.userId);
    }
    
    if (leadData.companyId && typeof leadData.companyId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(leadData.companyId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid companyId format: ${leadData.companyId}`
        });
      }
      leadData.companyId = new mongoose.Types.ObjectId(leadData.companyId);
    }
    
    if (leadData.gigId && typeof leadData.gigId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(leadData.gigId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid gigId format: ${leadData.gigId}`
        });
      }
      leadData.gigId = new mongoose.Types.ObjectId(leadData.gigId);
    }
    
    // Remove fields that are not in the schema
    const allowedFields = ['userId', 'companyId', 'gigId', 'Last_Activity_Time', 'Activity_Tag', 'Deal_Name', 'Stage', 'Email_1', 'Phone', 'Telephony', 'Pipeline', 'value'];
    const cleanedData: any = {};
    for (const field of allowedFields) {
      if (leadData[field] !== undefined) {
        cleanedData[field] = leadData[field];
      }
    }
    
    // Ensure required fields are present
    if (!cleanedData.Deal_Name) {
      return res.status(400).json({
        success: false,
        error: 'Deal_Name is required'
      });
    }
    
    if (!cleanedData.Stage) {
      return res.status(400).json({
        success: false,
        error: 'Stage is required'
      });
    }
    
    console.log('📝 Cleaned lead data:', JSON.stringify(cleanedData, null, 2));
    
    const lead = await Lead.create(cleanedData);

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (err: any) {
    console.error('❌ Error creating lead:', err);
    console.error('❌ Error details:', JSON.stringify(err, null, 2));
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e: any) => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate lead entry',
        details: err.message
      });
    }
    
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create lead',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Create multiple leads (bulk)
// @route   POST /api/leads/bulk
// @access  Private
export const createBulkLeads = async (req: Request, res: Response) => {
  const { leads } = req.body;
  const totalRequested = Array.isArray(leads) ? leads.length : 0;
  
  try {
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'leads must be a non-empty array'
      });
    }

    console.log(`📝 Creating ${leads.length} leads in bulk...`);
    
    // Validate and clean all leads
    const cleanedLeads: any[] = [];
    const errors: { index: number; error: string }[] = [];
    
    for (let i = 0; i < leads.length; i++) {
      const leadData: any = { ...leads[i] };
      
      // Validate ObjectId fields and convert strings to ObjectIds
      if (leadData.userId && typeof leadData.userId === 'string') {
        if (!mongoose.Types.ObjectId.isValid(leadData.userId)) {
          errors.push({ index: i, error: `Invalid userId format: ${leadData.userId}` });
          continue;
        }
        leadData.userId = new mongoose.Types.ObjectId(leadData.userId);
      }
      
      if (leadData.companyId && typeof leadData.companyId === 'string') {
        if (!mongoose.Types.ObjectId.isValid(leadData.companyId)) {
          errors.push({ index: i, error: `Invalid companyId format: ${leadData.companyId}` });
          continue;
        }
        leadData.companyId = new mongoose.Types.ObjectId(leadData.companyId);
      }
      
      if (leadData.gigId && typeof leadData.gigId === 'string') {
        if (!mongoose.Types.ObjectId.isValid(leadData.gigId)) {
          errors.push({ index: i, error: `Invalid gigId format: ${leadData.gigId}` });
          continue;
        }
        leadData.gigId = new mongoose.Types.ObjectId(leadData.gigId);
      }
      
      // Remove fields that are not in the schema
      const allowedFields = ['userId', 'companyId', 'gigId', 'Last_Activity_Time', 'Activity_Tag', 'Deal_Name', 'Stage', 'Email_1', 'Phone', 'Telephony', 'Pipeline', 'value'];
      const cleanedData: any = {};
      for (const field of allowedFields) {
        if (leadData[field] !== undefined) {
          cleanedData[field] = leadData[field];
        }
      }
      
      // Ensure required fields are present
      if (!cleanedData.Deal_Name) {
        errors.push({ index: i, error: 'Deal_Name is required' });
        continue;
      }
      
      if (!cleanedData.Stage) {
        errors.push({ index: i, error: 'Stage is required' });
        continue;
      }
      
      cleanedLeads.push(cleanedData);
    }
    
    if (cleanedLeads.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid leads to create',
        errors
      });
    }
    
    // Use insertMany for bulk insert (much faster)
    const result = await Lead.insertMany(cleanedLeads, { 
      ordered: false, // Continue even if some fail
      rawResult: true 
    });
    
    console.log(`✅ Bulk insert completed: ${result.insertedCount} leads created`);
    
    // Fetch the created leads to return them
    const insertedIds = Object.values(result.insertedIds);
    const createdLeads = await Lead.find({ _id: { $in: insertedIds } });
    
    res.status(201).json({
      success: true,
      data: createdLeads,
      insertedCount: result.insertedCount,
      totalRequested: totalRequested,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err: any) {
    console.error('❌ Error creating bulk leads:', err);
    
    // Handle bulk write errors
    if (err.name === 'BulkWriteError') {
      const insertedCount = err.result?.insertedCount || 0;
      const writeErrors = err.writeErrors || [];
      
      return res.status(207).json({ // 207 Multi-Status
        success: true,
        data: [],
        insertedCount,
        totalRequested: totalRequested,
        errors: writeErrors.map((e: any) => ({
          index: e.index,
          error: e.errmsg || e.err?.message || 'Unknown error'
        })),
        message: `Partially successful: ${insertedCount}/${totalRequested} leads created`
      });
    }
    
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to create bulk leads',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
export const updateLead = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
export const deleteLead = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
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

// @desc    Analyze lead using AI
// @route   POST /api/leads/:id/analyze
// @access  Private
export const analyzeLead = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    // Simulated AI analysis
    const analysis = {
      score: Math.floor(Math.random() * 30) + 70,
      sentiment: Math.random() > 0.5 ? 'Positive' : 'Neutral'
    };

    lead.metadata = {
      ...lead.metadata,
      ai_analysis: analysis
    };

    await lead.save();

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Generate script for lead interaction
// @route   POST /api/leads/:id/generate-script
// @access  Private
export const generateScript = async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    // Simulated script generation
    const script = {
      content: `Hello ${lead.name}, this is a ${type} script for ${lead.company}...`,
      type
    };

    res.status(200).json({
      success: true,
      data: script
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};