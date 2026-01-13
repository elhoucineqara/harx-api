import { Request, Response } from 'express';
import Agent from '../models/Agent';
import dbConnect from '../lib/dbConnect';

export const updateContactCenterAssessment = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const result = req.body; // The assessment result object
    const userId = req.params.id;

    // Find Agent profile
    let agent = await Agent.findOne({ userId });
    if (!agent) {
        agent = await Agent.findById(userId);
    }

    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    // Prepare the skill object
    const skillData = {
        category: result.category,
        skill: result.skill,
        proficiency: result.proficiency,
        assessmentResults: {
            category: result.category,
            skill: result.skill,
            score: result.assessmentResults.score,
            strengths: result.assessmentResults.strengths,
            improvements: result.assessmentResults.improvements,
            feedback: result.assessmentResults.feedback,
            tips: result.assessmentResults.tips,
            keyMetrics: result.assessmentResults.keyMetrics,
            completedAt: new Date()
        }
    };

    // Update or push to skills.contactCenter
    const existingIndex = agent.skills.contactCenter.findIndex(
      (s: any) => s.skill === result.skill && s.category === result.category
    );

    if (existingIndex >= 0) {
      agent.skills.contactCenter[existingIndex] = skillData;
    } else {
      agent.skills.contactCenter.push(skillData);
    }

    await agent.save();
    return res.json(agent);
  } catch (error: any) {
    console.error('Error updating contact center assessment:', error);
    return res.status(500).json({ error: error.message });
  }
};

