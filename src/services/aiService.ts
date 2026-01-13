import OpenAI from 'openai';
import dbConnect from '../lib/dbConnect';

// Configuration
const getOpenAIClient = (): OpenAI => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured properly');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

const PREDEFINED_CATEGORIES = [
  'Inbound Sales', 'Outbound Sales', 'Customer Service', 'Technical Support', 
  'Account Management', 'Lead Generation', 'Market Research', 'Appointment Setting', 
  'Order Processing', 'Customer Retention', 'Billing Support', 'Product Support', 
  'Help Desk', 'Chat Support', 'Email Support', 'Social Media Support', 
  'Survey Calls', 'Welcome Calls', 'Follow-up Calls', 'Complaint Resolution', 
  'Warranty Support', 'Collections', 'Dispatch Services', 'Emergency Support', 
  'Multilingual Support'
];

export interface TimezoneGenerationRequest {
  targetMarkets: any;
  description: string;
  activitiesData: any[];
  industriesData: any[];
  languagesData: any[];
  skillsData: { soft: any[], professional: any[], technical: any[] };
  timezonesData?: any[];
  countriesData?: any[];
  currenciesData?: any[];
}

export class AIService {
  generateDestinations(title: any, arg1: any, arg2: any) {
    throw new Error('Method not implemented.');
  }
  generateTimezones(request: TimezoneGenerationRequest) {
    throw new Error('Method not implemented.');
  }
  generateSkills(title: any, arg1: any, skillsData: { soft: any[]; professional: any[]; technical: any[]; }, languagesData: any[]) {
    throw new Error('Method not implemented.');
  }
  async generateGigSuggestions(
description: string, activitiesData: any[], industriesData: any[], languagesData: any[], skillsData: { soft: any[]; professional: any[]; technical: any[]; }, timezonesData?: any[], countriesData?: any[], currenciesData?: any[], currencyId?: any  ) {
    const openai = getOpenAIClient();

    const activityNames = activitiesData.map(activity => activity.name); // Use all activities, not just first 10
    const industryNames = industriesData.map(industry => industry.name); // Use all industries, not just first 10
    const languageNames = languagesData.map(lang => lang.name); // Use all languages, not just first 10
    const softSkillNames = skillsData.soft.map(skill => skill.name); // Use all skills, not just first 10
    const professionalSkillNames = skillsData.professional.map(skill => skill.name); // Use all skills, not just first 10
    const technicalSkillNames = skillsData.technical.map(skill => skill.name); // Use all skills, not just first 10
    const currencyNames = currenciesData ? currenciesData.map(currency => `${currency.code}`) : []; // Use all currencies, not just first 10
    
    const countryOptions = countriesData ? countriesData.slice(0, 30).map(country => `${country.name.common}: ${country._id}`).join(', ') : '';
    const timezoneOptions = timezonesData ? timezonesData.slice(0, 50).map(tz => `${tz.zoneName} (${tz.countryName})`).join(', ') : '';

    const prompt = `Based on: "${description}"

IMPORTANT: 
- Respond in the SAME LANGUAGE as input
- For destination_zone, use ONLY MongoDB ObjectId from COUNTRIES list
- Detect country from language/currency/context
- Use only options below:

CATEGORIES (choose the most appropriate one):
${PREDEFINED_CATEGORIES.join(', ')}

COUNTRIES (use the ObjectId for destination_zone):
${countryOptions}

TIMEZONES (use exact zoneName from this list, e.g., "Europe/Paris"):
${timezoneOptions}

ACTIVITIES (use exact names from this list): ${activityNames.join(', ')}
INDUSTRIES (use exact names from this list): ${industriesData.map(ind => `${ind.name} (${ind.code})`).join(', ')}
LANGUAGES (use exact names from this list): ${languagesData.map(lang => `${lang.name} (${lang.iso639_1})`).join(', ')}
SOFT SKILLS (use exact names from this list): ${softSkillNames.join(', ')}
PROFESSIONAL SKILLS (use exact names from this list): ${professionalSkillNames.join(', ')}
TECHNICAL SKILLS (use exact names from this list): ${technicalSkillNames.join(', ')}
CURRENCIES (use exact codes from this list): ${currencyNames.join(', ')}

JSON format:
{
  "jobTitles": ["Main job title"],
  "jobDescription": "Enhanced description",
  "highlights": ["Key selling point 1"],
  "deliverables": ["Expected outcome 1"],
  "category": "Category",
  "destination_zone": "MONGODB_OBJECTID",
  "activities": ["activity1"], // Use exact activity names from ACTIVITIES list above
  "industries": ["industry1"], // Use exact industry names from INDUSTRIES list above
  "seniority": { "level": "Mid-Level", "yearsExperience": 2 },
  "skills": {
    "languages": [{"language": "English", "proficiency": "C1", "iso639_1": "en"}], // Use exact language names from LANGUAGES list above
    "soft": [{"skill": "skillName", "level": 4, "details": "Brief explanation"}], // REQUIRED: level must be 0-5 (0=Novice, 1=Basic, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert). Use exact skill names from SOFT SKILLS list above
    "professional": [{"skill": "skillName", "level": 3, "details": "Brief explanation"}], // REQUIRED: level must be 0-5. Use exact skill names from PROFESSIONAL SKILLS list above
    "technical": [{"skill": "skillName", "level": 4, "details": "Brief explanation"}] // REQUIRED: level must be 0-5. Use exact skill names from TECHNICAL SKILLS list above
  },
  "availability": {
    "schedule": [{"day": "Monday", "hours": {"start": "09:00", "end": "17:00"}}],
    "time_zone": "Europe/Paris", // Use exact zoneName from TIMEZONES list above
    "flexibility": ["Flexible Hours"],
    "minimumHours": { "daily": 4, "weekly": 20, "monthly": 80 }
  },
  "commission": {
    "base": "Base + Commission",
    "baseAmount": 0,
    "bonus": "Performance Bonus",
    "bonusAmount": 150,
    "currency": "EUR", // Use exact currency code from CURRENCIES list above
    "minimumVolume": { "amount": 25, "period": "Monthly", "unit": "Calls" },
    "transactionCommission": { "type": "Fixed Amount", "amount": 50 }
  },
  "team": {
    "size": 1,
    "structure": [{"roleId": "Agent", "count": 1, "seniority": { "level": "Mid-Level", "yearsExperience": 2 }}],
    "territories": ["Morocco"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that creates comprehensive gig listings. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content received from OpenAI');

    let parsedResponse;
    try {
        parsedResponse = JSON.parse(content);
    } catch (e) {
        // Try extracting JSON
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            parsedResponse = JSON.parse(match[0]);
        } else {
            throw new Error('Invalid JSON response');
        }
    }

    // Helper function to find industry ID by name
    const findIndustryId = (industryName: string): string | null => {
      if (!industryName) return null;
      
      // Exact match
      const normalizedSearchName = industryName.toLowerCase().trim();
      let industry = industriesData.find(ind => 
        ind.name.toLowerCase().trim() === normalizedSearchName
      );
      
      if (industry) {
        return industry._id.toString();
      }
      
      // Partial match
      industry = industriesData.find(ind => {
        const normalizedIndustryName = ind.name.toLowerCase().trim();
        return normalizedIndustryName.includes(normalizedSearchName) || 
               normalizedSearchName.includes(normalizedIndustryName);
      });
      
      if (industry) {
        return industry._id.toString();
      }
      
      // Match by code
      industry = industriesData.find(ind => 
        ind.code?.toLowerCase().trim() === normalizedSearchName
      );
      
      if (industry) {
        return industry._id.toString();
      }
      
      return null;
    };

    // Helper function to find activity ID by name
    const findActivityId = (activityName: string): string | null => {
      if (!activityName) return null;
      
      const normalizedSearchName = activityName.toLowerCase().trim();
      
      // Exact match
      let activity = activitiesData.find(act => 
        act.name.toLowerCase().trim() === normalizedSearchName
      );
      
      if (activity) {
        return activity._id.toString();
      }
      
      // Partial match
      activity = activitiesData.find(act => {
        const normalizedActivityName = act.name.toLowerCase().trim();
        return normalizedActivityName.includes(normalizedSearchName) || 
               normalizedSearchName.includes(normalizedActivityName);
      });
      
      if (activity) {
        return activity._id.toString();
      }
      
      // Manual mappings for common variations
      const manualMappings: { [key: string]: string } = {
        'lead generation': 'Lead Generation',
        'appointment setting': 'Appointment Setting',
        'prospection': 'Lead Generation',
        'prise de rendez-vous': 'Appointment Setting',
        'génération de leads': 'Lead Generation',
        'vente sortante': 'Outbound Sales',
        'vente entrante': 'Inbound Sales',
        'support client': 'Customer Service',
        'service client': 'Customer Service',
        'customer support': 'Customer Service',
        'sales': 'Inbound Sales',
        'vente': 'Inbound Sales'
      };
      
      const mappedName = manualMappings[normalizedSearchName];
      if (mappedName) {
        activity = activitiesData.find(act => 
          act.name.toLowerCase() === mappedName.toLowerCase()
        );
        if (activity) {
          return activity._id.toString();
        }
      }
      
      return null;
    };

    // Helper function to find timezone ID by zoneName
    const findTimezoneId = (zoneName: string): string | null => {
      if (!zoneName || !timezonesData || timezonesData.length === 0) return null;
      
      const normalizedSearchName = zoneName.trim();
      
      // Exact match on zoneName
      let timezone = timezonesData.find(tz => 
        tz.zoneName && tz.zoneName.trim() === normalizedSearchName
      );
      
      if (timezone) {
        return timezone._id.toString();
      }
      
      // Case-insensitive match
      timezone = timezonesData.find(tz => 
        tz.zoneName && tz.zoneName.trim().toLowerCase() === normalizedSearchName.toLowerCase()
      );
      
      if (timezone) {
        return timezone._id.toString();
      }
      
      // Partial match
      timezone = timezonesData.find(tz => {
        if (!tz.zoneName) return false;
        const normalizedZoneName = tz.zoneName.trim().toLowerCase();
        return normalizedZoneName.includes(normalizedSearchName.toLowerCase()) || 
               normalizedSearchName.toLowerCase().includes(normalizedZoneName);
      });
      
      if (timezone) {
        return timezone._id.toString();
      }
      
      return null;
    };

    // Helper function to find language ID by name
    const findLanguageId = (languageName: string): string | null => {
      if (!languageName || !languagesData || languagesData.length === 0) return null;
      
      const normalizedSearchName = languageName.toLowerCase().trim();
      
      // Exact match on name
      let language = languagesData.find(lang => 
        lang.name && lang.name.toLowerCase().trim() === normalizedSearchName
      );
      
      if (language) {
        return language._id.toString();
      }
      
      // Match by iso639_1 code
      language = languagesData.find(lang => 
        lang.iso639_1 && lang.iso639_1.toLowerCase().trim() === normalizedSearchName
      );
      
      if (language) {
        return language._id.toString();
      }
      
      // Partial match
      language = languagesData.find(lang => {
        if (!lang.name) return false;
        const normalizedLangName = lang.name.toLowerCase().trim();
        return normalizedLangName.includes(normalizedSearchName) || 
               normalizedSearchName.includes(normalizedLangName);
      });
      
      if (language) {
        return language._id.toString();
      }
      
      return null;
    };

    // Helper function to find skill ID by name (for soft, professional, technical)
    const findSkillId = (skillName: string, skillType: 'soft' | 'professional' | 'technical'): string | null => {
      if (!skillName) return null;
      
      const skillArray = skillsData[skillType];
      if (!skillArray || skillArray.length === 0) return null;
      
      const normalizedSearchName = skillName.toLowerCase().trim();
      
      // Exact match
      let skill = skillArray.find(s => 
        s.name && s.name.toLowerCase().trim() === normalizedSearchName
      );
      
      if (skill) {
        return skill._id.toString();
      }
      
      // Partial match
      skill = skillArray.find(s => {
        if (!s.name) return false;
        const normalizedSkillName = s.name.toLowerCase().trim();
        return normalizedSkillName.includes(normalizedSearchName) || 
               normalizedSearchName.includes(normalizedSkillName);
      });
      
      if (skill) {
        return skill._id.toString();
      }
      
      return null;
    };

    // Helper function to find currency ID by code
    const findCurrencyId = (currencyCode: string): string | null => {
      if (!currencyCode || !currenciesData || currenciesData.length === 0) return null;
      
      const normalizedSearchCode = currencyCode.trim().toUpperCase();
      
      // Exact match on code
      const currency = currenciesData.find(curr => 
        curr.code && curr.code.trim().toUpperCase() === normalizedSearchCode
      );
      
      if (currency) {
        return currency._id.toString();
      }
      
      return null;
    };

    // Convert industries from names to IDs
    if (parsedResponse.industries && Array.isArray(parsedResponse.industries)) {
      parsedResponse.industries = parsedResponse.industries
        .map((industryName: string) => {
          const industryId = findIndustryId(industryName);
          if (industryId) {
            console.log(`✅ Mapped industry "${industryName}" to ID: ${industryId}`);
            return industryId;
          } else {
            console.warn(`⚠️ Could not find industry ID for: "${industryName}"`);
            return null;
          }
        })
        .filter((id: string | null) => id !== null);
    }

    // Convert activities from names to IDs
    if (parsedResponse.activities && Array.isArray(parsedResponse.activities)) {
      parsedResponse.activities = parsedResponse.activities
        .map((activityName: string) => {
          const activityId = findActivityId(activityName);
          if (activityId) {
            console.log(`✅ Mapped activity "${activityName}" to ID: ${activityId}`);
            return activityId;
          } else {
            console.warn(`⚠️ Could not find activity ID for: "${activityName}"`);
            return null;
          }
        })
        .filter((id: string | null) => id !== null);
    }

    // Convert timezone from zoneName to ID
    if (parsedResponse.availability?.time_zone) {
      const timezoneId = findTimezoneId(parsedResponse.availability.time_zone);
      if (timezoneId) {
        console.log(`✅ Mapped timezone "${parsedResponse.availability.time_zone}" to ID: ${timezoneId}`);
        parsedResponse.availability.time_zone = timezoneId;
      } else {
        console.warn(`⚠️ Could not find timezone ID for: "${parsedResponse.availability.time_zone}"`);
      }
    }

    // Convert languages from names to IDs
    if (parsedResponse.skills?.languages && Array.isArray(parsedResponse.skills.languages)) {
      parsedResponse.skills.languages = parsedResponse.skills.languages
        .map((langObj: any) => {
          const languageName = langObj.language || langObj.name;
          if (!languageName) return langObj;
          
          const languageId = findLanguageId(languageName);
          if (languageId) {
            console.log(`✅ Mapped language "${languageName}" to ID: ${languageId}`);
            return {
              ...langObj,
              language: languageId
            };
          } else {
            console.warn(`⚠️ Could not find language ID for: "${languageName}"`);
            return langObj;
          }
        });
    }

    // Convert soft skills from names to IDs
    if (parsedResponse.skills?.soft && Array.isArray(parsedResponse.skills.soft)) {
      parsedResponse.skills.soft = parsedResponse.skills.soft
        .map((skillObj: any) => {
          const skillName = skillObj.skill || skillObj.name;
          if (!skillName) return skillObj;
          
          const skillId = findSkillId(skillName, 'soft');
          if (skillId) {
            // Validate and ensure level is present (0-5)
            let level = skillObj.level;
            if (level === undefined || level === null) {
              console.warn(`⚠️ Missing level for soft skill "${skillName}", defaulting to 3 (Intermediate)`);
              level = 3; // Default to Intermediate
            } else if (typeof level !== 'number' || level < 0 || level > 5) {
              console.warn(`⚠️ Invalid level ${level} for soft skill "${skillName}", defaulting to 3`);
              level = 3;
            }
            
            console.log(`✅ Mapped soft skill "${skillName}" to ID: ${skillId}, level: ${level}`);
            return {
              ...skillObj,
              skill: skillId,
              level: Math.round(level), // Ensure it's an integer
              details: skillObj.details || ''
            };
          } else {
            console.warn(`⚠️ Could not find soft skill ID for: "${skillName}"`);
            return skillObj;
          }
        });
    }

    // Convert professional skills from names to IDs
    if (parsedResponse.skills?.professional && Array.isArray(parsedResponse.skills.professional)) {
      parsedResponse.skills.professional = parsedResponse.skills.professional
        .map((skillObj: any) => {
          const skillName = skillObj.skill || skillObj.name;
          if (!skillName) return skillObj;
          
          const skillId = findSkillId(skillName, 'professional');
          if (skillId) {
            // Validate and ensure level is present (0-5)
            let level = skillObj.level;
            if (level === undefined || level === null) {
              console.warn(`⚠️ Missing level for professional skill "${skillName}", defaulting to 3 (Intermediate)`);
              level = 3; // Default to Intermediate
            } else if (typeof level !== 'number' || level < 0 || level > 5) {
              console.warn(`⚠️ Invalid level ${level} for professional skill "${skillName}", defaulting to 3`);
              level = 3;
            }
            
            console.log(`✅ Mapped professional skill "${skillName}" to ID: ${skillId}, level: ${level}`);
            return {
              ...skillObj,
              skill: skillId,
              level: Math.round(level), // Ensure it's an integer
              details: skillObj.details || ''
            };
          } else {
            console.warn(`⚠️ Could not find professional skill ID for: "${skillName}"`);
            return skillObj;
          }
        });
    }

    // Convert technical skills from names to IDs
    if (parsedResponse.skills?.technical && Array.isArray(parsedResponse.skills.technical)) {
      parsedResponse.skills.technical = parsedResponse.skills.technical
        .map((skillObj: any) => {
          const skillName = skillObj.skill || skillObj.name;
          if (!skillName) return skillObj;
          
          const skillId = findSkillId(skillName, 'technical');
          if (skillId) {
            // Validate and ensure level is present (0-5)
            let level = skillObj.level;
            if (level === undefined || level === null) {
              console.warn(`⚠️ Missing level for technical skill "${skillName}", defaulting to 3 (Intermediate)`);
              level = 3; // Default to Intermediate
            } else if (typeof level !== 'number' || level < 0 || level > 5) {
              console.warn(`⚠️ Invalid level ${level} for technical skill "${skillName}", defaulting to 3`);
              level = 3;
            }
            
            console.log(`✅ Mapped technical skill "${skillName}" to ID: ${skillId}, level: ${level}`);
            return {
              ...skillObj,
              skill: skillId,
              level: Math.round(level), // Ensure it's an integer
              details: skillObj.details || ''
            };
          } else {
            console.warn(`⚠️ Could not find technical skill ID for: "${skillName}"`);
            return skillObj;
          }
        });
    }

    // Convert currency from code to ID
    if (parsedResponse.commission?.currency) {
      const currencyId = findCurrencyId(parsedResponse.commission.currency);
      if (currencyId) {
        console.log(`✅ Mapped currency "${parsedResponse.commission.currency}" to ID: ${currencyId}`);
        parsedResponse.commission.currency = currencyId;
      } else {
        console.warn(`⚠️ Could not find currency ID for: "${parsedResponse.commission.currency}"`);
      }
    }

    // Log skills with levels for verification
    if (parsedResponse.skills?.soft && parsedResponse.skills.soft.length > 0) {
      console.log('📊 SOFT SKILLS with levels:', parsedResponse.skills.soft.map((s: any) => ({
        skill: s.skill,
        level: s.level,
        details: s.details
      })));
    }
    if (parsedResponse.skills?.professional && parsedResponse.skills.professional.length > 0) {
      console.log('📊 PROFESSIONAL SKILLS with levels:', parsedResponse.skills.professional.map((s: any) => ({
        skill: s.skill,
        level: s.level,
        details: s.details
      })));
    }
    if (parsedResponse.skills?.technical && parsedResponse.skills.technical.length > 0) {
      console.log('📊 TECHNICAL SKILLS with levels:', parsedResponse.skills.technical.map((s: any) => ({
        skill: s.skill,
        level: s.level,
        details: s.details
      })));
    }

    console.log('📦 Processed response with IDs:', {
      industries: parsedResponse.industries,
      activities: parsedResponse.activities,
      time_zone: parsedResponse.availability?.time_zone,
      languages: parsedResponse.skills?.languages?.length || 0,
      softSkills: parsedResponse.skills?.soft?.length || 0,
      professionalSkills: parsedResponse.skills?.professional?.length || 0,
      technicalSkills: parsedResponse.skills?.technical?.length || 0,
      currency: parsedResponse.commission?.currency
    });

    return parsedResponse;
  }
}

export default new AIService();



