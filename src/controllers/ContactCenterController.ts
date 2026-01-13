const { OpenAI } = require('openai');
require('dotenv').config();

class ContactCenterController {
  getOpenAIInstance() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  generateScenario = async (req, res) => {
    try {
      const openai = this.getOpenAIInstance();
      const { skillName, category } = req.body;

      if (!skillName) {
        return res.status(400).json({ error: 'Skill name is required' });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
              role: "system",
              content: `Create a realistic contact center scenario to test ${skillName || 'customer service'} skills. Include:
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
              content: `Generate a scenario for testing ${skillName || 'customer service'} in ${category || 'Customer Service'}`
            }
          ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const scenarioData = JSON.parse(response.choices[0].message.content);
      return res.json(scenarioData);

    } catch (error) {
      console.error('Error generating scenario:', error);
      return res.status(500).json({ 
        error: 'Failed to generate scenario',
        details: error.message 
      });
    }
  }

  analyzeResponse = async (req, res) => {
    try {
      const openai = this.getOpenAIInstance();
      const { response, scenario, skillName } = req.body;

      if (!response || !scenario || !skillName) {
        return res.status(400).json({ error: 'Response, scenario, and skill name are required' });
      }

      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
              role: "system",
              content: `You are an expert contact center trainer. Analyze the agent's response based on ${skillName || 'customer service'} criteria.
              Provide detailed feedback in JSON format:
              {
                "score": number (0-100),
                "strengths": ["string"],
                "improvements": ["string"],
                "feedback": "string",
                "tips": ["string"],
                "keyMetrics": {
                  "professionalism": number (0-100),
                  "effectiveness": number (0-100),
                  "customerFocus": number (0-100)
                }
              }`
            },
            {
              role: "user",
              content: `Scenario: ${scenario}\nAgent's Response: ${response}\nEvaluation Criteria: ${JSON.stringify(scenario.evaluationCriteria)}`
            }
          ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const feedback = JSON.parse(analysisResponse.choices[0].message.content);
      return res.json(feedback);

    } catch (error) {
      console.error('Error analyzing response:', error);
      return res.status(500).json({ 
        error: 'Failed to analyze response',
        details: error.message 
      });
    }
  }
}

export default new ContactCenterController();
