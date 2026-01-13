import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import Company from '../models/Company';
import OnboardingProgress from '../models/OnboardingProgress';
import onboardingProgressService from '../services/onboardingProgressService';
import mongoose from 'mongoose';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const companyData = req.body;

    // Create company
    const company = new Company(companyData);
    await company.save();

    return res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const companies = await Company.find();

    return res.json({
      success: true,
      message: 'Companies retrieved successfully',
      data: companies,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir une company par userId - doit être avant /:userId pour éviter les conflits
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    console.log('🔍 [GET /companies/user/:userId] Request received:', req.params);
    await dbConnect();
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId format'
      });
    }
    
    const company = await Company.findOne({ userId });
    
    if (!company) {
      console.log('⚠️ [GET /companies/user/:userId] Company not found for userId:', userId);
      return res.status(404).json({
        success: false,
        message: 'Company not found for this user',
      });
    }

    console.log('✅ [GET /companies/user/:userId] Company found:', company._id);
    return res.json({
      success: true,
      message: 'Company retrieved successfully',
      data: company,
    });
  } catch (error: any) {
    console.error('❌ [GET /companies/user/:userId] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Route pour obtenir une company par companyId - doit être avant /:userId pour éviter les conflits
router.get('/:companyId', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId } = req.params;
    
    // Vérifier si c'est un ObjectId valide (pour distinguer d'un userId)
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid companyId format',
      });
    }
    
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    return res.json({
      success: true,
      message: 'Company retrieved successfully',
      data: company,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir une company par userId (fallback - moins spécifique)
router.get('/by-user/:userId', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { userId } = req.params;
    const company = await Company.findOne({ userId });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    return res.json({
      success: true,
      message: 'Company retrieved successfully',
      data: company,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// This route seems incomplete - commented out for now
// router.get('/:companyId', async (req: Request, res: Response) => {
//   const { companyId } = req.params;
//   const user = authenticate(req, res, () => {});
// });

router.get('/:companyId/:phaseId/:stepId', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const { companyId, phaseId, stepId } = req.params;
    console.log('🔍 GET onboarding step - params:', { companyId, phaseId, stepId });

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        message: 'Invalid Company ID format'
      });
    }

    const onboarding = await OnboardingProgress.findOne({ companyId });
    
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding progress not found',
      });
    }

    return res.json({
      success: true,
      message: 'Onboarding step retrieved successfully',
      data: onboarding,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:companyId/:phaseId/:stepId', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const { companyId, phaseId, stepId } = req.params;
    console.log('🔄 PUT onboarding step - params:', { companyId, phaseId, stepId });

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        message: 'Invalid Company ID format'
      });
    }

    // Safe parsing of request body with default value
    let body;
    try {
      body = req.body;
    } catch (e) {
      // If no body or invalid JSON, default to in_progress
      body = { status: 'in_progress' };
    }

    const { status = 'in_progress' } = body;

    const onboarding = await OnboardingProgress.findOne({ companyId });

// TODO: Convertir manuellement la route: companies/[companyId]/onboarding/route.ts
// Chemin Express: /:companyId/onboarding

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding progress not found',
      });
    }

    // Update the step status
    // TODO: Implement the actual update logic

    return res.json({
      success: true,
      message: 'Onboarding step updated successfully',
      data: onboarding,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/:companyId/onboarding', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Company ID format'
      });
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Check if onboarding already exists
    const existingOnboarding = await OnboardingProgress.findOne({ companyId });
    if (existingOnboarding) {
      return res.status(200).json({
        success: true,
        message: 'Onboarding progress already exists',
        data: existingOnboarding
      });
    }

    // Initialize onboarding progress
    try {
      const progress = await onboardingProgressService.initializeProgress(companyId);
      return res.status(201).json({
        success: true,
        message: 'Onboarding progress initialized successfully',
        data: progress
      });
    } catch (serviceError: any) {
      // If onboarding already exists (from service check), return existing
      if (serviceError.message?.includes('already exists')) {
        const existing = await OnboardingProgress.findOne({ companyId });
        if (existing) {
          return res.status(200).json({
            success: true,
            message: 'Onboarding progress already exists',
            data: existing
          });
        }
      }
      throw serviceError;
    }
  } catch (error: any) {
    console.error('Error initializing onboarding:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize onboarding progress'
    });
  }
});

router.get('/:companyId/onboarding', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const { companyId } = req.params;
    
    const searchParams = req.query;
    const phaseId = searchParams.phase;
    const stepId = searchParams.step;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Company ID format'
      });
    }

    // If phase and step are provided, return specific step info
    // Otherwise, return full onboarding progress
    if (phaseId && stepId) {
      const onboarding = await OnboardingProgress.findOne({ companyId });
      
      if (!onboarding) {
        return res.status(404).json({
          success: false,
          message: 'Onboarding progress not found',
        });
      }

      return res.json({
        success: true,
        message: 'Onboarding step retrieved successfully',
        data: onboarding,
      });
    } else {
      // Return full onboarding progress without requiring phase/step
      const onboarding = await OnboardingProgress.findOne({ companyId });
      
      if (!onboarding) {
        return res.status(404).json({
          success: false,
          message: 'Onboarding progress not found',
        });
      }

      return res.json({
        success: true,
        message: 'Onboarding progress retrieved successfully',
        data: onboarding,
      });
    }
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

router.put('/:companyId/onboarding', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const { companyId } = req.params;
    
    const searchParams = req.query;
    const phaseId = searchParams.phase;
    const stepId = searchParams.step;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        message: 'Invalid Company ID format'
      });
    }

    if (!phaseId || !stepId) {
      return res.status(400).json({
        message: 'Phase and step parameters are required'
      });
    }

    // Safe parsing of request body with default value
    let body;
    try {
      body = req.body;
    } catch (e) {
      // If no body or invalid JSON, default to in_progress
      body = { status: 'in_progress' };
    }

    const { status = 'in_progress' } = body;

    const onboarding = await OnboardingProgress.findOne({ companyId });
    
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding progress not found',
      });
    }

    // Update step progress using the service
    const updatedProgress = await onboardingProgressService.updateStepProgress(
      companyId,
      Number(phaseId),
      Number(stepId),
      status
    );

    return res.json({
      success: true,
      message: 'Onboarding progress updated successfully',
      data: updatedProgress,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});


router.put('/:companyId', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId } = req.params;
    const updateData = req.body;

    // Flatten nested data for update
    const flattenData = (data: any, prefix: string = ''): any => {
      let result: any = {};

      for (const [key, value] of Object.entries(data)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          result = { ...result, ...flattenData(value, newKey) };
        } else {
          result[newKey] = value;
        }
      }

      return result;
    };

    const flatData = flattenData(updateData);
    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: flatData },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    return res.json({
      success: true,
      message: 'Company retrieved successfully',
      data: company,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/:companyId', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId } = req.params;
    const company = await Company.findByIdAndDelete(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    return res.json({
      success: true,
      message: 'Company retrieved successfully',
      data: company,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
