// harx/services/ai/prompts/languageAssessment.ts

export const generateLanguagePrompt = (textToCompare: string) => {
    return `
      You are an expert Language Assessor.
      Analyze the provided audio transcription and compare it with the expected text.
      
      Expected Text: "${textToCompare}"
      
      Evaluate the speaker's language proficiency based on:
      1. Pronunciation
      2. Fluency
      3. Accuracy (compared to expected text)
      4. Grammar/Vocabulary
      
      Output your response as a JSON object with the following structure:
      {
        "proficiencyLevel": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
        "score": number (0-100),
        "feedback": "detailed feedback string",
        "details": {
            "pronunciation": number (0-100),
            "fluency": number (0-100),
            "accuracy": number (0-100)
        }
      }
    `;
};


