import { Request, Response } from 'express';
import aiService from '../../../../../services/aiService';
import Activity from '../../../../../models/Activity';
import Industry from '../../../../../models/Industry';
import Language from '../../../../../models/Language';
import { ProfessionalSkill, TechnicalSkill, SoftSkill } from '../../../../../models/Skill';
import Timezone from '../../../../../models/Timezone';
import Country from '../../../../../models/Country';
import Currency from '../../../../../models/Currency';
import dbConnect from '../../../../../lib/db/mongodb';

export const post = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { description } = body;

    await dbConnect();

    const [
      activities,
      industries,
      languages,
      softSkills,
      professionalSkills,
      technicalSkills,
      timezones,
      countries,
      currencies
    ] = await Promise.all([
      Activity.find(),
      Industry.find(),
      Language.find(),
      SoftSkill.find(),
      ProfessionalSkill.find(),
      TechnicalSkill.find(),
      Timezone.find(),
      Country.find(),
      Currency.find()
    ]);

    const suggestions = await aiService.generateGigSuggestions(
      description,
      activities,
      industries,
      languages,
      {
        soft: softSkills,
        professional: professionalSkills,
        technical: technicalSkills
      },
      timezones,
      countries,
      currencies
    );

    return res.json({ success: true, data: suggestions });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return res.json({ success: false, message: error.message }, { status: 500 });
  }
}



