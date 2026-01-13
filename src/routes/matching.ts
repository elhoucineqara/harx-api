import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import GigAgent from '../models/GigAgent';
import GigMatchingWeight from '../models/GigMatchingWeight';
import Gig from '../models/Gig';
import Agent from '../models/Agent';

const router = Router();

// IMPORTANT: Routes spécifiques doivent être définies AVANT les routes paramétrées
// Sinon Express va matcher "/reps" avec "/:gigId"

// Route pour obtenir tous les reps
router.get('/reps', async (req: Request, res: Response) => {
  try {
    await dbConnect();
  } catch (dbError: any) {
    console.error('Database connection error:', dbError);
    return res.status(500).json({ 
      success: false,
      error: 'Database connection failed',
      message: dbError.message 
    });
  }

  try {
    // Populate as much as possible to match the Rep interface
    const reps = await Agent.find({}).limit(1000).lean(); // Use lean() for better performance
    
    return res.json(reps); // Return array directly, not wrapped in success/data
  } catch (error: any) {
    console.error('Error fetching reps:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch reps',
      message: error.message 
    });
  }
});

// Route pour obtenir tous les gigs
router.get('/gigs', async (req: Request, res: Response) => {
  await dbConnect();

  try {
    const gigs = await Gig.find({});
    
    return res.json({ success: true, data: gigs });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Route pour créer un gig-agent
router.post('/gig-agents', async (req: Request, res: Response) => {
  await dbConnect();

  try {
    const body = req.body;
    const { gigId, agentId, matchDetails, status } = body;

    const gigAgent = await GigAgent.create({
      gigId,
      agentId,
      matchDetails,
      status: status || 'invited',
    });

    return res.status(201).json({ success: true, data: gigAgent });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/weights/:id', async (req: Request, res: Response) => {
  await dbConnect();
  const { id: gigId } = req.params;

  try {
    const weights = await GigMatchingWeight.findOne({ gigId });
    
    if (!weights) {
      return res.status(404).json({ success: false, message: 'Weights not found' });
    }

    return res.json({ success: true, data: weights });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/weights/:id', async (req: Request, res: Response) => {
  await dbConnect();
  const { id: gigId } = req.params;

  try {
    const body = req.body;
    const { matchingWeights } = body;

    const weights = await GigMatchingWeight.findOneAndUpdate(
      { gigId },
      { matchingWeights },
      { new: true, upsert: true }
    );

    return res.json({ success: true, data: weights });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/weights/:id', async (req: Request, res: Response) => {
  await dbConnect();
  const { id: gigId } = req.params;

  try {
    const weights = await GigMatchingWeight.findOneAndDelete({ gigId });
    
    if (!weights) {
      return res.status(404).json({ success: false, message: 'Weights not found' });
    }

    return res.json({ success: true, message: 'Weights deleted successfully' });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Route pour faire le matching pour un gig
router.post('/match/:id', async (req: Request, res: Response) => {
  await dbConnect();
  const { id: gigId } = req.params;

  try {
    const { weights } = req.body;

    // Import the matching function
    const { findMatchesForGig } = await import('../utils/matchingAlgorithm');
    const Agent = (await import('../models/Agent')).default;

    const gig = await Gig.findById(gigId)
      .populate('skills.professional.skill')
      .populate('skills.technical.skill')
      .populate('skills.soft.skill')
      .populate('skills.languages.language')
      .populate('industries')
      .populate('activities')
      .populate('destination_zone')
      .populate('availability.time_zone');

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Get all agents with populated data
    const agents = await Agent.find({})
      .populate('personalInfo.languages.language')
      .populate('personalInfo.country')
      .populate('availability.timeZone')
      .populate('professionalSummary.industries')
      .populate('professionalSummary.activities')
      .populate('skills.technical.skill')
      .populate('skills.professional.skill')
      .populate('skills.soft.skill');

    // Default weights if not provided
    const defaultWeights = {
      experience: 0.20,
      skills: 0.20,
      industry: 0.20,
      languages: 0.15,
      availability: 0.10,
      timezone: 0.15,
      activities: 0.0,
      region: 0.0
    };

    const finalWeights = { ...defaultWeights, ...weights };

    // Find matches using the matching algorithm
    const result = await findMatchesForGig(gig, agents, finalWeights, {
      limit: 50,
      minimumScore: 0.0,
      showAllScores: true
    });

    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in matching:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Route for gig-matching-weights (alias for /matching/weights/:id)
router.get('/gig-matching-weights/:gigId', async (req: Request, res: Response) => {
  await dbConnect();
  const { gigId } = req.params;

  try {
    const weights = await GigMatchingWeight.findOne({ gigId });
    
    if (!weights) {
      return res.status(404).json({ success: false, message: 'Weights not found' });
    }

    return res.json({ success: true, data: weights });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Route paramétrée à la fin - doit être après toutes les routes spécifiques
router.get('/:gigId', async (req: Request, res: Response) => {
  await dbConnect();
  const { gigId } = req.params;

  try {
    const gigAgents = await GigAgent.find({ gigId });
    
    return res.json({ success: true, data: gigAgents });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
