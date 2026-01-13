import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const post = async (req: Request, res: Response) => {
  try {
    const { results, profileData } = req.body;

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
    return res.json(recommendations);
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return res.status(500).json({ error: error.message });
  }
}

