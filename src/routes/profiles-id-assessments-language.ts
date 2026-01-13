import { Request, Response } from 'express';
import Agent from '../models/Agent';
import Language from '../models/Language';
import dbConnect from '../lib/dbConnect';

export const post = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { language, proficiency, results } = req.body;
    const { id: userId } = req.params;

    // Find the Language document
    const languageDoc = await Language.findOne({ 
        $or: [{ name: language }, { iso639_1: language.toLowerCase() }]
    });

    if (!languageDoc) {
      return res.status(404).json({ error: `Language '${language}' not found` });
    }

    // Find Agent profile
    let agent = await Agent.findOne({ userId });
    if (!agent) {
        // Try by _id if not found by userId
        agent = await Agent.findById(userId);
    }

    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    // Update languages array
    const existingIndex = agent.personalInfo.languages.findIndex(
      (l: any) => l.language.toString() === languageDoc._id.toString()
    );

    const assessmentResults = {
        overall: results.overall,
        fluency: results.fluency,
        completeness: results.completeness,
        proficiency: results.proficiency,
        completedAt: new Date()
    };

    if (existingIndex >= 0) {
      agent.personalInfo.languages[existingIndex].proficiency = proficiency;
      agent.personalInfo.languages[existingIndex].assessmentResults = assessmentResults;
    } else {
      agent.personalInfo.languages.push({
        language: languageDoc._id,
        proficiency,
        assessmentResults
      });
    }

    await agent.save();
    return res.json(agent);
  } catch (error: any) {
    console.error('Error updating language assessment:', error);
    return res.status(500).json({ error: error.message });
  }
}
