// harx/services/ai/prompts/contactCenterAssessment.ts

export const generatePrompt = (scenarioData: any) => {
    return `
      You are an expert Contact Center Evaluator. 
      Analyze the following scenario and the representative's response.
      
      Scenario:
      ${JSON.stringify(scenarioData, null, 2)}
      
      Provide a detailed evaluation of the representative's performance based on:
      1. Empathy
      2. Problem Solving
      3. Communication Skills
      4. Adherence to Guidelines
      
      Output your response as a JSON object with the following structure:
      {
        "score": number (0-100),
        "feedback": "detailed feedback string",
        "strengths": ["list", "of", "strengths"],
        "improvements": ["list", "of", "improvements"]
      }
    `;
};


