const { OpenAI } = require('openai');
require('dotenv').config();

class LanguageAssessmentController {
  getOpenAIInstance() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Méthode utilitaire pour valider un code de langue
   */
  validateLanguageCode(code) {
    return code.length === 2 && /^[a-z]{2}$/.test(code);
  }

  /**
   * Méthode utilitaire pour obtenir un code de langue depuis OpenAI
   */
  async getLanguageCodeFromAI(language) {
    try {
      const openai = this.getOpenAIInstance();
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a language expert. Given a language name or identifier, return ONLY the corresponding ISO 639-1 two-letter language code. 
            For example:
            - "English" -> "en"
            - "français" -> "fr"
            - "中文" -> "zh"
            - "العربية" -> "ar"
            Return ONLY the two-letter code, nothing else.`
          },
          {
            role: "user",
            content: language
          }
        ],
        temperature: 0.1,
        max_tokens: 2
      });

      const languageCode = response.choices[0].message.content.trim().toLowerCase();
      
      if (!this.validateLanguageCode(languageCode)) {
        throw new Error(`Invalid language code returned: ${languageCode}`);
      }

      return languageCode;
    } catch (error) {
      throw new Error(`Unable to determine language code for: ${language}`);
    }
  }

  /**
   * Méthode utilitaire pour normaliser et obtenir un code de langue
   */
  async normalizeLanguageCode(language) {
    if (!language) return null;
    
    const normalizedInput = language.toLowerCase().trim();
    
    // First check if it's already a 2-letter code
    if (this.validateLanguageCode(normalizedInput)) {
      return normalizedInput;
    }
    
    // Try to get code from name using AI
    return await this.getLanguageCodeFromAI(language);
  }

  /**
   * Méthode utilitaire pour générer un passage aléatoire
   */
  async generateRandomPassage(language, targetLanguageCode) {
    try {
      const openai = this.getOpenAIInstance();
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a creative content creator for language learning assessments. Generate an original, engaging passage in the target language.

            Guidelines:
            - Write directly in the language: ${language} (ISO code: ${targetLanguageCode})
            - Create interesting, varied content on any topic you find engaging
            - Make it suitable for reading aloud assessment
            - Length should be around 80-120 words for good assessment
            - Include natural flow and varied vocabulary
            - Choose any difficulty level and topic that feels right
            - Be creative and original - no restrictions on themes or complexity
            - Make it engaging and interesting to read
            
            Format the response as JSON: {
              "text": "the generated passage text",
              "title": "an appropriate title for the passage",
              "estimatedDuration": number (in seconds for reading aloud, typically 40-60)
            }`
          },
          {
            role: "user",
            content: `Generate a creative, original reading passage in ${language}. Be completely free in your choice of topic and style.`
          }
        ],
        temperature: 0.9,
        response_format: { type: "json_object" }
      });

      const generationResult = JSON.parse(response.choices[0].message.content);
      
      return {
        text: generationResult.text,
        title: generationResult.title,
        estimatedDuration: generationResult.estimatedDuration || 45,
        code: targetLanguageCode,
        generatedAt: new Date().toISOString(),
        id: `${targetLanguageCode}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      };
    } catch (error) {
      throw new Error(`Passage generation failed for ${language}: ${error.message}`);
    }
  }

  analyzeLanguageAssessment = async (req, res) => {
    try {
      const openai = this.getOpenAIInstance();
      const { passage, language } = req.body;

      if (!passage || !language) {
        return res.status(400).json({ error: 'Passage and language are required' });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a language assessment expert. Analyze the following reading passage and provide a detailed assessment with scores and feedback in the following JSON format:
            {
              "pronunciation": {
                "score": number (1-10),
                "feedback": "string"
              },
              "fluency": {
                "score": number (1-10),
                "feedback": "string"
              },
              "comprehension": {
                "score": number (1-10),
                "feedback": "string"
              },
              "vocabulary": {
                "score": number (1-10),
                "feedback": "string"
              },
              "overall": {
                "score": number (1-100),
                "feedback": "string"
              },
              "language_code": "string"
            }`
          },
          {
            role: "user",
            content: `Reading passage: ${passage}\nSimulate assessment for ${language} language proficiency.`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const assessmentResults = JSON.parse(response.choices[0].message.content);
      return res.json(assessmentResults);

    } catch (error) {
      console.error('Error analyzing language assessment:', error);
      return res.status(500).json({ 
        error: 'Failed to analyze language assessment',
        details: error.message 
      });
    }
  }

  getLanguageCode = async (req, res) => {
    try {
      const { language } = req.body;

      if (!language) {
        return res.status(400).json({ error: 'Language is required' });
      }

      const languageCode = await this.getLanguageCodeFromAI(language);
      return res.json({ languageCode });
      
    } catch (error) {
      console.error('Error getting language code:', error);
      return res.status(500).json({ 
        error: 'Failed to get language code',
        details: error.message 
      });
    }
  }

  getPassage = async (req, res) => {
    try {
      const { language } = req.body;

      if (!language) {
        return res.status(400).json({ error: 'Language is required' });
      }

      // Get standardized language code
      const langCode = await this.normalizeLanguageCode(language);
      if (!langCode) {
        throw new Error(`Unable to determine language code for: ${language}`);
      }

      // Generate passage
      const passage = await this.generateRandomPassage(language, langCode);
      return res.json(passage);

    } catch (error) {
      console.error('Error getting passage:', error);
      return res.status(500).json({ 
        error: 'Failed to get passage',
        details: error.message 
      });
    }
  }

  generatePassage = async (req, res) => {
    try {
      const { language, targetLanguageCode } = req.body;

      if (!language || !targetLanguageCode) {
        return res.status(400).json({ error: 'Language and target language code are required' });
      }

      const passage = await this.generateRandomPassage(language, targetLanguageCode);
      return res.json(passage);

    } catch (error) {
      console.error('Error generating passage:', error);
      return res.status(500).json({ 
        error: 'Failed to generate passage',
        details: error.message 
      });
    }
  }
}

export default new LanguageAssessmentController();
