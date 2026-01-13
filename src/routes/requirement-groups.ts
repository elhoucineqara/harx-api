import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import TelnyxRequirementGroup from '../models/TelnyxRequirementGroup';
import telnyxRequirementGroupService from '../services/TelnyxRequirementGroupService';
import { config } from '../config/env';
import Telnyx from 'telnyx';
import mongoose from 'mongoose';

const router = Router();

// IMPORTANT: Specific routes must be defined BEFORE parameterized routes
// Route: GET /api/requirement-groups/companies/:companyId/zones/:destinationZone
router.get('/companies/:companyId/zones/:destinationZone', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId, destinationZone } = req.params;
    
    if (!companyId || !destinationZone) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'companyId and destinationZone are required'
      });
    }

    console.log(`🔍 Getting requirement group for company: ${companyId}, zone: ${destinationZone}`);
    
    // Try to find existing group in database
    const existingGroup = await telnyxRequirementGroupService.findOne({
      companyId,
      destinationZone
    });

    if (existingGroup) {
      console.log('✅ Found existing group:', existingGroup._id);
      return res.json(existingGroup);
    }

    // If not found, return 404
    return res.status(404).json({
      error: 'Not Found',
      message: 'Requirement group not found'
    });
  } catch (error: any) {
    console.error('❌ Error getting requirement group:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to get requirement group'
    });
  }
});

// Route: POST /api/requirement-groups (create new group)
router.post('/', async (req: Request, res: Response) => {
  try {
        await dbConnect();
    const { companyId, destinationZone } = req.body;
    
    if (!companyId || !destinationZone) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'companyId and destinationZone are required'
      });
    }

    console.log(`🆕 Creating requirement group for company: ${companyId}, zone: ${destinationZone}`);

    // Check if group already exists
    const existingGroup = await telnyxRequirementGroupService.findOne({
      companyId,
      destinationZone
    });

    if (existingGroup) {
      console.log('⚠️ Group already exists:', existingGroup._id);
      return res.status(409).json({
        error: 'Conflict',
        message: 'Requirement group already exists',
        data: existingGroup
      });
    }

    // Create requirement group with Telnyx
    if (!config.TELNYX_API_KEY) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'TELNYX_API_KEY not configured'
      });
    }

    const telnyxClient = new Telnyx({ apiKey: config.TELNYX_API_KEY });
    
    // Create requirement group in Telnyx
    // Note: Telnyx SDK uses requirement_groups (with underscore) in the API path
    const telnyxResponse = await telnyxClient.requirementGroups.create({
      country_code: destinationZone,
      phone_number_type: 'local',
      action: 'ordering'
    });

    console.log('📝 Telnyx requirement group created:', telnyxResponse.id);

    // Map requirements from Telnyx response
    // The response contains regulatory_requirements array
    const requirements = (telnyxResponse.regulatory_requirements || []).map((req: any) => ({
      requirementId: req.requirement_id,
      type: req.field_type || 'textual',
      status: 'pending'
    }));

    // Save to database
    const newGroup = await telnyxRequirementGroupService.create({
      telnyxId: telnyxResponse.id,
      companyId,
      destinationZone,
      status: telnyxResponse.status || 'pending',
      requirements
    });

    console.log('✅ Requirement group created and saved:', newGroup._id);
    
    return res.status(201).json(newGroup);
  } catch (error: any) {
    console.error('❌ Error creating requirement group:', error);
    
    // Handle specific Telnyx errors
    if (error.status === 409 || error.code === 'conflict') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Requirement group already exists in Telnyx'
      });
    }
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to create requirement group'
    });
  }
});

// IMPORTANT: This route must be defined BEFORE /:groupId/status to avoid route conflicts
// Route: PATCH /api/requirement-groups/:groupId/requirements
router.patch('/:groupId/requirements', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { groupId } = req.params;
    const { requirements } = req.body;
    
    if (!groupId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'groupId is required'
      });
    }

    if (!requirements || !Array.isArray(requirements) || requirements.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'requirements array is required'
      });
    }

    console.log(`📝 Updating requirements for group ${groupId}`);

    // 1. Find the group in database (use model directly to get Mongoose document)
    const group = await TelnyxRequirementGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Requirement group not found'
      });
    }

    // 2. Update in Telnyx first
    if (!config.TELNYX_API_KEY) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'TELNYX_API_KEY not configured'
      });
    }

    const telnyxClient = new Telnyx({ apiKey: config.TELNYX_API_KEY });
    
    // Prepare update data for Telnyx
    const updateData = {
      regulatory_requirements: requirements.map((req: any) => ({
        requirement_id: req.requirementId,
        field_value: req.value
      }))
    };

    console.log('📤 Updating Telnyx requirement group:', group.telnyxId);
    await telnyxClient.requirementGroups.update(group.telnyxId, updateData);

    // 3. Update local database
    for (const req of requirements) {
      const requirement = group.requirements.find((r: any) => r.requirementId === req.requirementId);
      if (requirement) {
        requirement.submittedValueId = req.value;
        requirement.submittedAt = new Date();
        requirement.status = 'completed'; // Mark as completed once a value is submitted
      } else {
        // If requirement doesn't exist in group, add it
        group.requirements.push({
          requirementId: req.requirementId,
          type: 'textual',
          status: 'completed',
          submittedValueId: req.value,
          submittedAt: new Date()
        });
      }
    }

    // Save updated group using save() to properly handle subdocuments
    await group.save();

    console.log('✅ Requirements updated successfully');
    
    // Return the updated group (already saved, so we can use it directly)
    return res.json(group);
  } catch (error: any) {
    console.error('❌ Error updating requirements:', error);
    
    // Handle specific Telnyx errors
    if (error.status === 404 || error.code === 'not_found') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Requirement group not found in Telnyx'
      });
    }
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to update requirements'
    });
  }
});

// Route: GET /api/requirement-groups/:groupId/status
router.get('/:groupId/status', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { groupId } = req.params;
    
    if (!groupId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'groupId is required'
      });
    }

    console.log(`🔍 Getting status for requirement group: ${groupId}`);
    
    const group = await telnyxRequirementGroupService.getById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Requirement group not found'
      });
    }

    // Calculate status
    const totalRequirements = group.requirements?.length || 0;
    const completedRequirements = group.requirements?.filter((r: any) => r.status === 'approved' || r.status === 'completed') || [];
    const pendingRequirements = group.requirements?.filter((r: any) => r.status === 'pending') || [];
    const isComplete = totalRequirements > 0 && completedRequirements.length === totalRequirements;

    return res.json({
      id: group._id.toString(),
      status: group.status,
      destinationZone: group.destinationZone,
      requirements: group.requirements?.map((r: any) => ({
        requirementId: r.requirementId,
        field: r.requirementId,
        status: r.status,
        rejectionReason: r.rejectionReason,
        submittedValueId: r.submittedValueId,
        submittedAt: r.submittedAt
      })) || [],
      validUntil: group.updatedAt ? new Date(group.updatedAt.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      isComplete,
      totalRequirements,
      completedRequirements: completedRequirements.map((r: any) => ({
        id: r.requirementId,
        status: r.status,
        value: r.submittedValueId,
        submittedAt: r.submittedAt,
        rejectionReason: r.rejectionReason
      })),
      completedRequirementsCount: completedRequirements.length,
      pendingRequirements: pendingRequirements.length
    });
  } catch (error: any) {
    console.error('❌ Error getting requirement group status:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to get requirement group status'
    });
  }
});

export default router;
