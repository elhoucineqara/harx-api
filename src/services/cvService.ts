import OpenAI from 'openai';

class CVService {
  private getOpenAIInstance() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async extractBasicInfo(contentToProcess: string) {
    try {
      const openai = this.getOpenAIInstance();

      if (!contentToProcess) {
        throw new Error('Content is required');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert CV analyzer. Extract the following basic information from the CV and return it in the exact JSON format shown below:
            {
              "name": "string",
              "country": "string (MUST be the 2-letter ISO country code as used by timezoneDB API - e.g., 'FR' for France, 'GB' for United Kingdom, 'US' for United States, 'SS' for South Sudan, 'DE' for Germany, 'CA' for Canada, etc.)",
              "email": "string",
              "phone": "string",
              "currentRole": "string",
              "yearsOfExperience": "number (MUST be an integer between 0 and 50)"
            }`
          },
          {
            role: "user",
            content: contentToProcess
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');
      return JSON.parse(content);
    } catch (error: any) {
      console.error('Error extracting basic info:', error);
      throw new Error(`Failed to extract basic information from CV: ${error.message}`);
    }
  }

  async analyzeExperience(contentToProcess: string) {
    try {
      const openai = this.getOpenAIInstance();

      if (!contentToProcess) {
        throw new Error('Content is required');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Analyze the work experience section of this CV and return it in the exact JSON format shown below. Follow these rules strictly:

            Date Formatting Rules:
            1. All dates must be in ISO format (YYYY-MM-DD)
            2. For current/ongoing positions:
               - endDate MUST be exactly the string "present" (lowercase)
               - Do not use any other variations like "Present", "now", "current", etc.
            3. For completed positions:
               - endDate must be a valid date in YYYY-MM-DD format
               - If only month and year are provided, use the last day of that month
               - If only year is provided, use December 31st of that year
            4. For startDate:
               - Must always be a valid date in YYYY-MM-DD format
               - If only month and year are provided, use the first day of that month
               - If only year is provided, use January 1st of that year

            Return in this exact format:
            {
              "roles": [{
                "title": "string",
                "company": "string",
                "startDate": "YYYY-MM-DD",  // Must be a valid date
                "endDate": "YYYY-MM-DD" | "present",  // Must be either a valid date or exactly "present"
                "responsibilities": ["string"],
                "achievements": ["string"]
              }],
              "keyAreas": ["string"],
              "notableCompanies": ["string"]
            }

            Example of valid dates:
            - startDate: "2024-01-01"  // January 2024
            - endDate: "2024-03-31"    // March 2024
            - endDate: "present"        // Current position`
          },
          {
            role: "user",
            content: contentToProcess
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');
      return JSON.parse(content);
    } catch (error: any) {
      console.error('Error analyzing experience:', error);
      throw new Error(`Failed to analyze experience: ${error.message}`);
    }
  }

  async analyzeSkills(contentToProcess: string) {
    try {
      const openai = this.getOpenAIInstance();

      if (!contentToProcess) {
        throw new Error('Content is required');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Analyze the CV for skills and competencies, with special attention to language proficiency evaluation. You MUST extract ALL languages mentioned in the CV, even if they are mentioned briefly or without explicit proficiency levels. For languages, you must intelligently map any proficiency description to the CEFR scale (A1-C2) based on the following comprehensive guidelines:

            CEFR Level Assessment Guidelines:

            A1 (Beginner/Basic)
            - Can understand and use basic phrases
            - Can introduce themselves and others
            - Expressions suggesting A1: basic, elementary, débutant, notions, beginner, basic words and phrases
            - Context clues: "took introductory courses", "basic communication", "learning basics"

            A2 (Elementary)
            - Can communicate in simple, routine situations
            - Can describe aspects of background, environment
            - Expressions suggesting A2: pre-intermediate, basic working knowledge, connaissance basique, can read simple texts
            - Context clues: "can handle simple work communications", "basic professional interactions"

            B1 (Intermediate)
            - Can deal with most situations while traveling
            - Can describe experiences, events, dreams, hopes
            - Expressions suggesting B1: intermediate, working knowledge, niveau moyen, bonne base, conversational
            - Context clues: "can participate in meetings", "handle routine work tasks"

            B2 (Upper Intermediate)
            - Can interact with degree of fluency with native speakers
            - Can produce clear, detailed text
            - Expressions suggesting B2: upper intermediate, professional working, bonne maitrise, fluent, professional proficiency
            - Context clues: "regular professional use", "conduct business meetings", "negotiate with clients"

            C1 (Advanced)
            - Can use language flexibly and effectively
            - Can produce clear, well-structured, detailed texts
            - Expressions suggesting C1: advanced, highly fluent, excellent, très bonne maitrise, native-like, full professional proficiency
            - Context clues: "worked in language", "lived in country for years", "conducted complex negotiations"

            C2 (Mastery)
            - Can understand virtually everything heard or read
            - Can express themselves spontaneously, precisely, and fluently
            - Expressions suggesting C2: native, mother tongue, bilingual, langue maternelle, perfect mastery
            - Context clues: "native speaker", "grew up speaking", "primary language of education"

            Analysis Instructions:
            1. CRITICAL: Extract ALL languages mentioned in the CV, regardless of how briefly they are mentioned
            2. Look for languages in ALL sections of the CV including:
               - Language sections
               - Education history (e.g. courses taken in different languages)
               - Work experience (e.g. working with international teams)
               - Skills sections
               - Personal projects or achievements
            3. For each language found, look for both explicit statements and contextual clues about language use
            4. Consider the professional context where the language is used
            5. Look for indicators of duration and depth of language exposure
            6. If the CV mentions work experience or education in a country, factor this into the assessment
            7. When in doubt between two levels, consider the overall context of language use
            8. Default to B1 only if there's significant uncertainty and no contextual clues
            9. If a language is mentioned but there are absolutely no clues about proficiency level, default to A1
            10. For each language, determine the ISO 639-1 two-letter language code (e.g., "en" for English, "fr" for French, "zh" for Chinese, "de" for German, "es" for Spanish, "it" for Italian, "pt" for Portuguese, "nl" for Dutch, "ru" for Russian, "ja" for Japanese, "ko" for Korean, "ar" for Arabic, "hi" for Hindi, "zh" for Chinese)
            11. IMPORTANT: Only return languages where you are confident about the correct ISO 639-1 code. If unsure about a language code, default to common languages or skip if completely uncertain.

            Return in this exact JSON format:
            {
              "technical": [{
                "name": "string",
                "confidence": number,
                "context": "string"
              }],
              "professional": [{
                "name": "string",
                "confidence": number,
                "context": "string"
              }],
              "soft": [{
                "name": "string",
                "confidence": number,
                "context": "string"
              }],
              "languages": [{
                "language": "string",
                "proficiency": "string (MUST be one of: A1, A2, B1, B2, C1, C2)",
                "iso639_1": "string (two-letter ISO 639-1 language code)"
              }]
            }`
          },
          {
            role: "user",
            content: contentToProcess
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');
      return JSON.parse(content);
    } catch (error: any) {
      console.error('Error analyzing skills:', error);
      throw new Error(`Failed to analyze skills: ${error.message}`);
    }
  }

  async analyzeAchievements(contentToProcess: string) {
    try {
      const openai = this.getOpenAIInstance();

      if (!contentToProcess) {
        throw new Error('Content is required');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Analyze the CV for notable achievements and projects and return them in the exact JSON format shown below:
            {
              "items": [{
                "description": "string",
                "impact": "string",
                "context": "string",
                "skills": ["string"]
              }]
            }`
          },
          {
            role: "user",
            content: contentToProcess
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');
      return JSON.parse(content);
    } catch (error: any) {
      console.error('Error analyzing achievements:', error);
      throw new Error(`Failed to analyze achievements: ${error.message}`);
    }
  }

  async analyzeAvailability(contentToProcess: string) {
    try {
      const openai = this.getOpenAIInstance();

      if (!contentToProcess) {
        throw new Error('Content is required');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Analyze the CV for any mentions of working hours, availability, or schedule preferences. Look for:
            1. Preferred working hours
            2. Time zone or location-based working hours
            3. Schedule flexibility (remote work, flexible hours, etc.)
            4. Any specific working day preferences

            Return in this exact JSON format:
            {
              "schedule": [{
                "day": "string (one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)",
                "hours": {
                  "start": "string (HH:MM format)",
                  "end": "string (HH:MM format)"
                }
              }],
              "timeZone": "string",
              "flexibility": ["string"]
            }`
          },
          {
            role: "user",
            content: contentToProcess
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');
      return JSON.parse(content);
    } catch (error: any) {
      console.error('Error analyzing availability:', error);
      throw new Error(`Failed to analyze availability: ${error.message}`);
    }
  }

  async generateSummary(profileData: any) {
    try {
      const openai = this.getOpenAIInstance();

      if (!profileData) {
        throw new Error('Profile data is required');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional CV writer. Create a compelling professional summary that follows the REPS framework:
            - Role: Current position and career focus
            - Experience: Years of experience and key industries
            - Projects: Notable achievements and contributions
            - Skills: Core technical and professional competencies
            
            Keep the summary concise, impactful, and achievement-oriented.`
          },
          {
            role: "user",
            content: `Create a professional REPS summary based on this profile data: ${JSON.stringify(profileData)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    } catch (error: any) {
      console.error('Error generating summary:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }
}

export const cvService = new CVService();

