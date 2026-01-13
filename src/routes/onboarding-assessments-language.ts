import { Request, Response } from 'express';
import OpenAI from 'openai';
import ISO6391 from 'iso-639-1';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REFERENCE_PASSAGE = {
  text: `The digital revolution has transformed how we live and work. In today's interconnected world, technology plays a pivotal role in shaping our daily experiences. From artificial intelligence to renewable energy, innovations continue to drive progress and create new opportunities. As we navigate these changes, it's crucial to understand both the benefits and challenges of our increasingly digital society.`,
  estimatedDuration: 45,
  difficulty: "intermediate",
  code: "en"
};

// Simple in-memory cache (Note: resets on server restart/lambda cold start)
// For production, use Redis or DB.
const passageCache = new Map();
passageCache.set('en', REFERENCE_PASSAGE);

export const get = async (req: Request, res: Response) => {
  const language = req.query.language as string;

  if (!language) {
    return res.status(400).json({ error: 'Language parameter is required' });
  }

  try {
    // 1. Get language code
    // Cast to string to satisfy type checker, as we're handling the fallback logic
    let langCode: string | null = ISO6391.getCode(language) || (ISO6391.validate(language) ? language : null);

    if (!langCode) {
        // Fallback to AI for code detection
        const codeResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Return ONLY the ISO 639-1 two-letter language code for: ${language}`
                }
            ],
            temperature: 0.1,
            max_tokens: 5
        });
        langCode = codeResponse.choices[0].message.content?.trim().toLowerCase().substring(0, 2) || 'en';
    }

    // 2. Check cache
    if (passageCache.has(langCode)) {
      return res.json(passageCache.get(langCode));
    }

    // 3. Translate
    const targetLanguageName = ISO6391.getName(langCode) || language;
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text to ${targetLanguageName} (${langCode}). 
            Maintain the same tone, formality, and meaning. Return ONLY the translated text, nothing else.`
          },
          {
            role: "user",
            content: REFERENCE_PASSAGE.text
          }
        ],
        temperature: 0.3
      });
  
      const translatedText = response.choices[0].message.content?.trim();
      
      const newPassage = {
        text: translatedText,
        estimatedDuration: REFERENCE_PASSAGE.estimatedDuration,
        difficulty: REFERENCE_PASSAGE.difficulty,
        code: langCode
      };
  
      passageCache.set(langCode, newPassage);
      return res.json(newPassage);

  } catch (error: any) {
    console.error('Error generating passage:', error);
    return res.status(500).json({ error: error.message });
  }
}

