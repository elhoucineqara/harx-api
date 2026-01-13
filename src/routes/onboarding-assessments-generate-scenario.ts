import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const post = async (req: Request, res: Response) => {
  try {
    const { skillName, categoryName } = req.body;

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

    const scenarioData = JSON.parse(response.choices[0].message.content || '{}');
    return res.json(scenarioData);
  } catch (error: any) {
    console.error('Error generating scenario:', error);
    return res.status(500).json({ error: error.message });
  }
}

