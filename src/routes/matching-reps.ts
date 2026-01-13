import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';
import User from '@/models/User';
import Timezone from '@/models/Timezone';
import Language from '@/models/Language';
import SoftSkill from '@/models/SoftSkill';
import ProfessionalSkill from '@/models/ProfessionalSkill';
import TechnicalSkill from '@/models/TechnicalSkill';
import Industry from '@/models/Industry';
import Activity from '@/models/Activity';

export const get = async (req: Request, res: Response) => {
  await connectDB();

  try {
    // Populate as much as possible to match the Rep interface
    const reps = await Agent.find({})
      .populate('userId', 'email personalInfo')
      .populate('personalInfo.country', 'name')
      .populate('personalInfo.languages.language', 'name code')
      .populate('skills.soft.skill', 'name')
      .populate('skills.professional.skill', 'name')
      .populate('skills.technical.skill', 'name')
      .populate('professionalSummary.industries', 'name')
      .populate('professionalSummary.activities', 'name')
      .lean();

    // Transform to match frontend Rep interface if necessary
    const formattedReps = reps.map((rep: any) => {
      // Basic transformation if structure differs slightly
      return rep;
    });

    return res.json(formattedReps);
  } catch (error: any) {
    console.error('Error fetching reps:', error);
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}


