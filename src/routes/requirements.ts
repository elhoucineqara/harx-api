import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import { requirementService } from '../services/requirementService';

const router = Router();

// IMPORTANT: Specific routes must be defined BEFORE parameterized routes
// Route: GET /api/requirements/countries/:countryCode/requirements
router.get('/countries/:countryCode/requirements', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { countryCode } = req.params;
    
    if (!countryCode) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Country code is required'
      });
    }

    console.log(`🔍 Fetching requirements for country: ${countryCode}`);
    
    const requirements = await requirementService.getCountryRequirements(countryCode);
    
    return res.json(requirements);
  } catch (error: any) {
    console.error('❌ Error fetching country requirements:', error);
    
    // Handle specific Telnyx errors
    if (error.status === 404 || error.code === 'not_found') {
      return res.status(200).json({
        hasRequirements: false
      });
    }
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch country requirements'
    });
  }
});

// Keep the old route for backward compatibility
router.get('/:countryCode', async (req: Request, res: Response) => {
  try {
    // Await params (Next.js 15+ requirement)
    await dbConnect();
    const { countryCode } = req.params;
    
    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    // Forward to actual backend microservice
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(
      `${backendUrl}/requirements/countries/${countryCode}/requirements`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
