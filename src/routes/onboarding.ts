import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import onboardingProgressService from '../services/onboardingProgressService';

let openai: any = null;
const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
};

const router = Router();

router.post('/assessments/analyze-text', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { scenario, response: agentResponse, evaluationCriteria, skillName } = req.body;

    const openai = getOpenAI();
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI not configured' });
    }

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert contact center trainer. Analyze the agent's response based on ${skillName} criteria.
          Provide detailed feedback in JSON format:
          {
            "score": number (1-100),
            "strengths": ["string"],
            "improvements": ["string"],
            "feedback": "string",
            "tips": ["string"],
            "keyMetrics": {
              "professionalism": number (1-100),
              "effectiveness": number (1-100),
              "customerFocus": number (1-100)
            }
          }`
        },
        {
          role: "user",
          content: `Scenario: ${scenario}\nAgent's Response: ${agentResponse}\nEvaluation Criteria: ${JSON.stringify(evaluationCriteria)}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}');
    return res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/assessments/generate-scenario', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { skillName, categoryName } = req.body;

    const openai = getOpenAI();
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI not configured' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Create a realistic contact center scenario to test ${skillName} skills. Include:
          1. Customer situation/problem
          2. Key challenges
          3. Expected response elements
          4. Evaluation criteria
          
          Format as JSON:
          {
            "scenario": "string",
            "customerProfile": "string",
            "challenge": "string",
            "expectedElements": ["string"],
            "evaluationCriteria": ["string"],
            "difficulty": "string"
          }`
        },
        {
          role: "user",
          content: `Generate a scenario for testing ${skillName} in ${categoryName}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const scenario = JSON.parse(response.choices[0].message.content || '{}');
    return res.json({ success: true, data: scenario });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/assessments/language', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { language } = req.query;

    if (!language) {
      return res.status(400).json({ error: 'Language parameter is required' });
    }

    // TODO: Implement language assessment logic
    return res.json({ success: true, message: 'Language assessment not yet implemented', language });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/assessments/recommendations', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { results, profileData } = req.body;

    const openai = getOpenAI();
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI not configured' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `As a contact center career advisor, analyze the assessment results and provide comprehensive recommendations.
          Format response as JSON:
          {
            "overallScore": number,
            "profileSummary": "string",
            "keyStrengths": ["string"],
            "developmentAreas": ["string"],
            "recommendedRoles": [{
              "role": "string",
              "confidence": number,
              "rationale": "string",
              "requirements": ["string"],
              "skillsMatch": ["string"]
            }],
            "careerPath": {
              "immediate": "string",
              "shortTerm": "string",
              "longTerm": "string"
            },
            "trainingRecommendations": ["string"],
            "keySkills": [{
              "name": "string",
              "proficiency": number
            }]
          }`
        },
        {
          role: "user",
          content: `Assessment results: ${JSON.stringify(results)}\nProfile data: ${JSON.stringify(profileData)}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const recommendations = JSON.parse(response.choices[0].message.content || '{}');
    return res.json({ success: true, data: recommendations });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:companyId/complete-last', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId } = req.params;
    const progress = await onboardingProgressService.completeLastPhaseAndStep(companyId);
    return res.json({
        message: 'Last phase and step completed successfully',
        progress
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:companyId/phase', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId } = req.params;
    const body = req.body;
    const { phase } = body;
    const progress = await onboardingProgressService.updateCurrentPhase(companyId, parseInt(phase));
    return res.json(progress);
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:companyId/fix-phase', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId } = req.params;
    const progress = await onboardingProgressService.fixCurrentPhase(companyId);
    return res.json({
        message: 'Current phase fixed successfully',
        progress
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
    const body = req.body;
    const { status } = body;
    const progress = await onboardingProgressService.updateStepProgress(companyId, parseInt(phaseId), parseInt(stepId), status);
    return res.json(progress);
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/:companyId/reset', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId } = req.params;
    const progress = await onboardingProgressService.resetProgress(companyId);
    return res.json(progress);
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/:companyId/initialize', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId } = req.params;
    const progress = await onboardingProgressService.initializeProgress(companyId);
    return res.status(201).json(progress);
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:companyId', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { companyId } = req.params;
    const progress = await onboardingProgressService.getProgress(companyId);
    return res.json(progress);
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { userId } = req.params;
    const progress = await onboardingProgressService.getProgressByUserId(userId);
    return res.json(progress);
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
