import { Request, Response, Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/cv-analysis', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text content is required'
      });
    }

    // Limit text length to prevent timeout (approximately 10000 characters)
    const maxTextLength = 10000;
    const truncatedText = text.length > maxTextLength 
      ? text.substring(0, maxTextLength) + '... [truncated]'
      : text;

    console.log('Starting CV analysis...', { textLength: text.length, truncated: text.length > maxTextLength });

    // Define prompts (copied from frontend code)
    const basicInfoPrompt = {
        role: "system",
        content: `You are an expert CV analyzer. Extract the following basic information from the CV and return it in the exact JSON format shown below:
        {
          "name": "string",
          "location": "string",
          "email": "string",
          "phone": "string",
          "currentRole": "string",
          "yearsOfExperience": "string"
        }`
    };

    const experiencePrompt = {
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
          "industries": ["string"],
          "keyAreas": ["string"],
          "notableCompanies": ["string"]
        }`
    };

    const skillsPrompt = {
        role: "system",
        content: `Analyze the CV for skills and competencies, with special attention to language proficiency evaluation. You MUST extract ALL languages mentioned in the CV, even if they are mentioned briefly or without explicit proficiency levels. For languages, you must intelligently map any proficiency description to the CEFR scale (A1-C2) based on the following comprehensive guidelines:

        CEFR Level Assessment Guidelines:
        (Guidelines omitted for brevity, assume full context is available if needed by AI)
        
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
            "proficiency": "string (MUST be one of: A1, A2, B1, B2, C1, C2)"
          }]
        }`
    };

    const achievementsPrompt = {
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
    };

    // Run parallel analysis with timeout
    const timeout = 60000; // 60 seconds timeout per request
    
    const createRequestWithTimeout = (prompt: any, userContent: string) => {
      return Promise.race([
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: prompt.content as string }, { role: "user", content: userContent }],
          temperature: 0.3,
          response_format: { type: "json_object" },
          max_tokens: 2000 // Limit tokens to speed up response
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), timeout)
        )
      ]) as Promise<any>;
    };

    const [basicInfoRes, experienceRes, skillsRes, achievementsRes] = await Promise.all([
        createRequestWithTimeout(basicInfoPrompt, truncatedText),
        createRequestWithTimeout(experiencePrompt, truncatedText),
        createRequestWithTimeout(skillsPrompt, truncatedText),
        createRequestWithTimeout(achievementsPrompt, truncatedText)
    ]);

    const basicInfo = JSON.parse(basicInfoRes.choices[0].message.content || '{}');
    const experience = JSON.parse(experienceRes.choices[0].message.content || '{}');
    const skills = JSON.parse(skillsRes.choices[0].message.content || '{}');
    const achievements = JSON.parse(achievementsRes.choices[0].message.content || '{}');

    // Combine data
    const defaultArrays = {
        technical: [],
        professional: [],
        soft: [],
        languages: [],
        industries: [],
        keyAreas: [],
        notableCompanies: [],
        roles: [],
        items: []
    };

    const combinedData = {
        personalInfo: {
            name: basicInfo.name || '',
            location: basicInfo.location || '',
            email: basicInfo.email || '',
            phone: basicInfo.phone || '',
            languages: skills.languages || defaultArrays.languages
        },
        professionalSummary: {
            yearsOfExperience: basicInfo.yearsOfExperience || '',
            currentRole: basicInfo.currentRole || '',
            industries: experience.industries || defaultArrays.industries,
            keyExpertise: experience.keyAreas || defaultArrays.keyAreas,
            notableCompanies: experience.notableCompanies || defaultArrays.notableCompanies
        },
        skills: {
            technical: (skills.technical || defaultArrays.technical).map((s: any) => ({
                skill: s.name,
                level: s.confidence,
                details: s.context
            })),
            professional: (skills.professional || defaultArrays.professional).map((s: any) => ({
                skill: s.name,
                level: s.confidence,
                details: s.context
            })),
            soft: (skills.soft || defaultArrays.soft).map((s: any) => ({
                skill: s.name,
                level: s.confidence,
                details: s.context
            }))
        },
        achievements: (achievements.items || defaultArrays.items).map((a: any) => ({
            description: a.description || '',
            impact: a.impact || '',
            context: a.context || '',
            skills: a.skills || []
        })),
        experience: (experience.roles || defaultArrays.roles).map((role: any) => {
            const startDate = new Date(role.startDate);
            let endDate;
            if (role.endDate === 'present') {
                endDate = 'present';
            } else {
                endDate = new Date(role.endDate);
            }
            return {
                title: role.title,
                company: role.company,
                startDate,
                endDate,
                responsibilities: role.responsibilities || [],
                achievements: role.achievements || []
            };
        })
    };

    // Generate summary
    const summaryResponse = await openai.chat.completions.create({
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
                content: `Create a professional REPS summary based on this profile data: ${JSON.stringify(combinedData)}`
            }
        ],
        temperature: 0.7,
        max_tokens: 500
    });

    const summary = summaryResponse.choices[0].message.content;

    return res.json({
        success: true,
        data: combinedData,
        summary
    });

  } catch (error: any) {
    console.error('CV analysis error:', error);
    
    // Handle specific OpenAI connection errors
    if (error.code === 'ENOTFOUND' || error.message?.includes('Connection error')) {
      return res.status(503).json({
        success: false,
        message: 'OpenAI service is currently unavailable. Please check your internet connection and try again.',
        error: 'Connection error'
      });
    }
    
    // Handle timeout errors
    if (error.message?.includes('timed out') || error.message === 'Request timed out') {
      return res.status(504).json({
        success: false,
        message: 'CV analysis timed out. The CV might be too long. Please try with a shorter CV or try again later.',
        error: 'Request timed out.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze CV',
      error: error.message || 'Unknown error'
    });
  }
});

export default router;

