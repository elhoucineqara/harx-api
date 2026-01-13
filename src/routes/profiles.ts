import { Router, Request, Response } from 'express';
import dbConnect from '../lib/dbConnect';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import Agent from '../models/Agent';
import Language from '../models/Language';
import TechnicalSkill from '../models/TechnicalSkill';
import ProfessionalSkill from '../models/ProfessionalSkill';
import SoftSkill from '../models/SoftSkill';
import Industry from '../models/Industry';
import Activity from '../models/Activity';
import Country from '../models/Country';
import Timezone from '../models/Timezone';
import mongoose from 'mongoose';
import multer from 'multer';
import { deleteFromCloudinary } from '../services/cloudinaryService';
import cloudinary from 'cloudinary';

const router = Router();

router.get('/exists', authenticate, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    // TODO: Implement profile exists check
    return res.json({ exists: false });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    // TODO: Implement get profiles
    return res.json({ success: true, data: [] });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await dbConnect();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'User ID not found in token' });
    }

    const userId = req.user.userId;
    const profileData = req.body;

    // Check if profile already exists
    let agent = await Agent.findOne({ userId });

    // Helper function to find or create language
    const findOrCreateLanguage = async (langName: string, proficiency: string) => {
      let lang = await Language.findOne({ 
        $or: [
          { name: { $regex: new RegExp(`^${langName}$`, 'i') } },
          { code: langName.toLowerCase() }
        ]
      });
      
      if (!lang) {
        // Create language if it doesn't exist
        lang = await Language.create({
          name: langName,
          code: langName.toLowerCase().substring(0, 2)
        });
      }
      
      return {
        language: lang._id,
        proficiency: proficiency as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
      };
    };

    // Helper function to find skill by name
    const findSkill = async (skillName: string, SkillModel: any) => {
      const skill = await SkillModel.findOne({ 
        name: { $regex: new RegExp(`^${skillName}$`, 'i') } 
      });
      return skill?._id;
    };

    // Process languages
    const languages = [];
    if (profileData.personalInfo?.languages) {
      for (const lang of profileData.personalInfo.languages) {
        // Handle different language formats:
        // 1. lang.language could be a string (language name or ISO code)
        // 2. lang.language could be an object (from database with _id, name, iso639_1)
        // 3. lang.name could be a string
        // 4. lang could be a string directly
        let langName: string;
        let proficiency = lang.proficiency || 'B1';
        
        if (typeof lang === 'string') {
          langName = lang;
        } else if (lang.language) {
          // If lang.language is an object, extract the name or iso639_1
          if (typeof lang.language === 'object' && lang.language !== null) {
            // If it's already a database object with _id, use it directly
            if (lang.language._id) {
              languages.push({
                language: lang.language._id,
                proficiency: proficiency as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
              });
              continue; // Skip to next language
            }
            // Otherwise extract name or iso639_1
            langName = lang.language.name || lang.language.iso639_1 || String(lang.language);
          } else {
            langName = String(lang.language);
          }
        } else if (lang.name) {
          langName = String(lang.name);
        } else {
          // Fallback: try to convert to string
          langName = String(lang);
        }
        
        // Ensure langName is a valid string before calling toLowerCase
        if (typeof langName !== 'string' || langName.trim() === '') {
          console.warn('Invalid language name, skipping:', lang);
          continue;
        }
        
        const langData = await findOrCreateLanguage(
          langName,
          proficiency
        );
        languages.push(langData);
      }
    }

    // Process skills (similar to languages processing)
    const processSkills = async (skills: any[], SkillModel: any) => {
      const processedSkills = [];
      for (const skill of skills || []) {
        let skillId = null;
        
        // Handle different skill formats (similar to languages):
        // 1. skill.skill could be an object (from database with _id, name, category)
        // 2. skill.skill could be a string (skill name or ID)
        // 3. skill.name could be a string
        // 4. skill could be a string directly
        
        if (skill.skill) {
          // If it's an object with _id, use it directly (like languages)
          if (typeof skill.skill === 'object' && skill.skill !== null) {
            if (skill.skill._id) {
              skillId = skill.skill._id;
            } else {
              // Object without _id, try to extract name
              const skillName = skill.skill.name || String(skill.skill);
              skillId = await findSkill(skillName, SkillModel);
            }
          } else if (mongoose.Types.ObjectId.isValid(skill.skill)) {
            // It's already an ID string, use it directly
            skillId = new mongoose.Types.ObjectId(skill.skill);
          } else {
            // It's a name string, search for it
            skillId = await findSkill(skill.skill, SkillModel);
          }
        } else if (skill.name) {
          // Only name provided, search for it
          skillId = await findSkill(skill.name, SkillModel);
        } else if (typeof skill === 'string') {
          // Skill is a string directly
          skillId = await findSkill(skill, SkillModel);
        }
        
        if (skillId) {
          processedSkills.push({
            skill: skillId,
            level: skill.level || 3,
            details: skill.details || ''
          });
        } else {
          console.warn(`Skill not found in database: ${JSON.stringify(skill)}`);
        }
      }
      return processedSkills;
    };

    const technicalSkills = await processSkills(profileData.skills?.technical || [], TechnicalSkill);
    const professionalSkills = await processSkills(profileData.skills?.professional || [], ProfessionalSkill);
    const softSkills = await processSkills(profileData.skills?.soft || [], SoftSkill);

    // Ensure at least one skill per category (OBLIGATORY)
    if (technicalSkills.length === 0) {
      const defaultTechnical = await TechnicalSkill.findOne({ isActive: true }).sort({ createdAt: 1 });
      if (defaultTechnical) {
        technicalSkills.push({
          skill: defaultTechnical._id,
          level: 3,
          details: 'Default technical skill'
        });
        console.log(`Added default technical skill: ${defaultTechnical.name}`);
      } else {
        return res.status(400).json({ error: 'No technical skills found in database. At least one technical skill is required.' });
      }
    }
    
    if (professionalSkills.length === 0) {
      const defaultProfessional = await ProfessionalSkill.findOne({ isActive: true }).sort({ createdAt: 1 });
      if (defaultProfessional) {
        professionalSkills.push({
          skill: defaultProfessional._id,
          level: 3,
          details: 'Default professional skill'
        });
        console.log(`Added default professional skill: ${defaultProfessional.name}`);
      } else {
        return res.status(400).json({ error: 'No professional skills found in database. At least one professional skill is required.' });
      }
    }
    
    if (softSkills.length === 0) {
      const defaultSoft = await SoftSkill.findOne({ isActive: true }).sort({ createdAt: 1 });
      if (defaultSoft) {
        softSkills.push({
          skill: defaultSoft._id,
          level: 3,
          details: 'Default soft skill'
        });
        console.log(`Added default soft skill: ${defaultSoft.name}`);
      } else {
        return res.status(400).json({ error: 'No soft skills found in database. At least one soft skill is required.' });
      }
    }

    // Process industries
    const industryIds = [];
    if (profileData.professionalSummary?.industries) {
      for (const industryName of profileData.professionalSummary.industries) {
        let industry = await Industry.findOne({ 
          name: { $regex: new RegExp(`^${industryName}$`, 'i') } 
        });
        if (industry) {
          industryIds.push(industry._id);
        }
      }
    }
    
    // Ensure at least one industry (OBLIGATORY)
    if (industryIds.length === 0) {
      const defaultIndustry = await Industry.findOne({ isActive: true }).sort({ createdAt: 1 });
      if (defaultIndustry) {
        industryIds.push(defaultIndustry._id);
        console.log(`Added default industry: ${defaultIndustry.name}`);
      } else {
        return res.status(400).json({ error: 'No industries found in database. At least one industry is required.' });
      }
    }
    
    // Process activities
    const activityIds = [];
    if (profileData.professionalSummary?.activities) {
      for (const activityName of profileData.professionalSummary.activities) {
        let activity = await Activity.findOne({ 
          name: { $regex: new RegExp(`^${activityName}$`, 'i') } 
        });
        if (activity) {
          activityIds.push(activity._id);
        }
      }
    }
    
    // Ensure at least one activity (OBLIGATORY)
    if (activityIds.length === 0) {
      const defaultActivity = await Activity.findOne({ isActive: true }).sort({ createdAt: 1 });
      if (defaultActivity) {
        activityIds.push(defaultActivity._id);
        console.log(`Added default activity: ${defaultActivity.name}`);
      } else {
        return res.status(400).json({ error: 'No activities found in database. At least one activity is required.' });
      }
    }

    // Process country (similar to languages)
    let countryId = null;
    if (profileData.personalInfo?.country) {
      const country = profileData.personalInfo.country;
      if (typeof country === 'object' && country !== null) {
        if (country._id) {
          countryId = country._id;
        } else if (country.name || country.code) {
          const countryName = country.name || country.code;
          const foundCountry = await Country.findOne({
            $or: [
              { name: { $regex: new RegExp(`^${countryName}$`, 'i') } },
              { code: { $regex: new RegExp(`^${countryName}$`, 'i') } },
              { iso2: { $regex: new RegExp(`^${countryName}$`, 'i') } }
            ]
          });
          if (foundCountry) {
            countryId = foundCountry._id;
          }
        }
      } else if (typeof country === 'string') {
        const foundCountry = await Country.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${country}$`, 'i') } },
            { code: { $regex: new RegExp(`^${country}$`, 'i') } },
            { iso2: { $regex: new RegExp(`^${country}$`, 'i') } }
          ]
        });
        if (foundCountry) {
          countryId = foundCountry._id;
        }
      }
    }

    // Process timezone (similar to languages)
    let timezoneId = null;
    if (profileData.availability?.timeZone) {
      const timezone = profileData.availability.timeZone;
      if (typeof timezone === 'object' && timezone !== null) {
        if (timezone._id) {
          timezoneId = timezone._id;
        } else if (timezone.name || timezone.zone) {
          const timezoneName = timezone.name || timezone.zone;
          const foundTimezone = await Timezone.findOne({
            $or: [
              { name: { $regex: new RegExp(`^${timezoneName}$`, 'i') } },
              { zone: { $regex: new RegExp(`^${timezoneName}$`, 'i') } }
            ]
          });
          if (foundTimezone) {
            timezoneId = foundTimezone._id;
          }
        }
      } else if (typeof timezone === 'string') {
        const foundTimezone = await Timezone.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${timezone}$`, 'i') } },
            { zone: { $regex: new RegExp(`^${timezone}$`, 'i') } }
          ]
        });
        if (foundTimezone) {
          timezoneId = foundTimezone._id;
        }
      }
    }

    // Process experience
    const experience = (profileData.experience || []).map((exp: any) => ({
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
      endDate: exp.endDate === 'present' ? 'present' : (exp.endDate ? new Date(exp.endDate) : undefined),
      responsibilities: exp.responsibilities || [],
      achievements: exp.achievements || []
    }));

    // Prepare agent data
    const agentData: any = {
      userId: new mongoose.Types.ObjectId(userId),
      status: 'in_progress',
      isBasicProfileCompleted: true,
      personalInfo: {
        name: profileData.personalInfo?.name || '',
        email: profileData.personalInfo?.email || '',
        phone: profileData.personalInfo?.phone || '',
        location: profileData.personalInfo?.location || '',
        country: countryId,
        languages: languages
      },
      professionalSummary: {
        yearsOfExperience: parseInt(profileData.professionalSummary?.yearsOfExperience) || 0,
        currentRole: profileData.professionalSummary?.currentRole || '',
        industries: industryIds,
        activities: activityIds,
        keyExpertise: profileData.professionalSummary?.keyExpertise || [],
        notableCompanies: profileData.professionalSummary?.notableCompanies || [],
        profileDescription: profileData.generatedSummary || profileData.professionalSummary?.profileDescription || ''
      },
      skills: {
        technical: technicalSkills,
        professional: professionalSkills,
        soft: softSkills,
        contactCenter: []
      },
      achievements: profileData.achievements || [],
      experience: experience,
      availability: {
        schedule: profileData.availability?.schedule || [],
        timeZone: timezoneId,
        flexibility: profileData.availability?.flexibility || []
      },
      onboardingProgress: {
        currentPhase: 1,
        phases: {
          phase1: { 
            status: 'completed', 
            requiredActions: {
              accountCreated: true,
              emailVerified: true
            },
            optionalActions: {
              locationConfirmed: false,
              identityVerified: false,
              twoFactorEnabled: false
            }
          },
          phase2: { 
            status: 'in_progress', 
            requiredActions: {
              experienceAdded: false,
              skillsAdded: false,
              industriesAdded: false,
              activitiesAdded: false
            },
            optionalActions: {
              photoUploaded: false,
              bioCompleted: false
            }
          },
          phase3: { 
            status: 'not_started', 
            requiredActions: {
              languageAssessmentDone: false,
              contactCenterAssessmentDone: false
            },
            optionalActions: {}
          },
          phase4: { 
            status: 'not_started', 
            requiredActions: {},
            optionalActions: {}
          }
        },
        lastUpdated: new Date()
      },
      lastUpdated: new Date()
    };

    if (agent) {
      // Update existing profile
      Object.assign(agent, agentData);
      await agent.save();
    } else {
      // Create new profile
      agent = await new Agent(agentData).save();
    }

    // Populate references before returning
    await agent.populate([
      { path: 'personalInfo.languages.language' },
      { path: 'skills.technical.skill' },
      { path: 'skills.professional.skill' },
      { path: 'skills.soft.skill' },
      { path: 'professionalSummary.industries' }
    ]);

    return res.json({ 
      success: true, 
      data: agent,
      message: agent ? 'Profile updated successfully' : 'Profile created successfully'
    });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

router.post('/:id/contact-center-assessment', authenticate, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const result = req.body; // The assessment result object
    const { id: userId } = req.params;

    // Find Agent profile
    let agent = await Agent.findOne({ userId });

    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    // TODO: Save assessment results
    return res.json({ success: true, message: 'Assessment saved', data: result });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});


router.post('/:id/language-assessment', authenticate, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { language, proficiency, results } = req.body;
    const { id: userId } = req.params;

    // Find the Language document
    const languageDoc = await Language.findOne({ 
        $or: [{ name: language }, { iso639_1: language.toLowerCase() }]
    });

    if (!languageDoc) {
      return res.status(404).json({ error: `Language '${language}' not found` });
    }

    // Find Agent profile
    const agent = await Agent.findOne({ userId });
    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    // TODO: Save language assessment results
    return res.json({ success: true, message: 'Language assessment saved', data: results });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});


router.put('/:id/experience', authenticate, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    // TODO: Implement update experience
    return res.json({ success: true, message: 'Not implemented' });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id/basic-info', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await dbConnect();
    
    const { id } = req.params;
    const basicInfo = req.body;
    
    console.log(`📝 Updating basic info for profile ID: ${id}`, { basicInfo });
    
    // Find the agent profile
    let agent = await Agent.findById(id);
    if (!agent) {
      // Try to find by userId if id is not a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        console.error(`Profile not found with ID: ${id}`);
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }
      // Try finding by userId
      const userIdQuery = req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : null;
      if (!userIdQuery) {
        return res.status(401).json({ success: false, error: 'User ID not found' });
      }
      agent = await Agent.findOne({ userId: userIdQuery });
      if (!agent) {
        console.error(`Profile not found with userId: ${userIdQuery}`);
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }
    }

    console.log(`✅ Found agent profile: ${agent._id}`);

    // Initialize personalInfo if it doesn't exist
    if (!agent.personalInfo) {
      agent.personalInfo = {
        name: '',
        languages: []
      } as any;
    }

    // Update name if provided
    if (basicInfo.name !== undefined) {
      agent.personalInfo.name = basicInfo.name;
      console.log(`✅ Updated name: ${basicInfo.name}`);
    }

    // Update email if provided
    if (basicInfo.email !== undefined) {
      agent.personalInfo.email = basicInfo.email;
      console.log(`✅ Updated email: ${basicInfo.email}`);
    }

    // Update phone if provided
    if (basicInfo.phone !== undefined) {
      agent.personalInfo.phone = basicInfo.phone;
      console.log(`✅ Updated phone: ${basicInfo.phone}`);
    }

    // Update country if provided
    if (basicInfo.country !== undefined) {
      console.log(`🌍 Processing country update:`, { 
        country: basicInfo.country, 
        type: typeof basicInfo.country,
        isObject: typeof basicInfo.country === 'object',
        isNull: basicInfo.country === null
      });
      
      let countryId = null;
      
      // Handle different country formats
      if (basicInfo.country === null || basicInfo.country === '') {
        countryId = null;
        console.log(`🌍 Country is null or empty, clearing country`);
      } else if (typeof basicInfo.country === 'object' && basicInfo.country !== null) {
        // If it's an object with _id
        if (basicInfo.country._id) {
          countryId = new mongoose.Types.ObjectId(basicInfo.country._id);
          console.log(`🌍 Country is object with _id: ${countryId}`);
        } else if (basicInfo.country.code) {
          // Find by code
          const foundCountry = await Country.findOne({
            $or: [
              { code: { $regex: new RegExp(`^${basicInfo.country.code}$`, 'i') } },
              { iso2: { $regex: new RegExp(`^${basicInfo.country.code}$`, 'i') } }
            ]
          });
          if (foundCountry) {
            countryId = foundCountry._id;
            console.log(`✅ Found country by code: ${foundCountry.name} (${foundCountry.code})`);
          } else {
            console.warn(`⚠️ Country not found by code: ${basicInfo.country.code}`);
          }
        } else {
          console.warn(`⚠️ Country object has no _id or code:`, basicInfo.country);
        }
      } else if (mongoose.Types.ObjectId.isValid(basicInfo.country)) {
        // If it's already an ObjectId string
        countryId = new mongoose.Types.ObjectId(basicInfo.country);
        console.log(`🌍 Country is valid ObjectId string: ${countryId}`);
        
        // Verify the country exists
        const countryExists = await Country.findById(countryId);
        if (!countryExists) {
          console.warn(`⚠️ Country ObjectId ${countryId} not found in database`);
          countryId = null;
        } else {
          console.log(`✅ Verified country exists: ${countryExists.name} (${countryExists.code})`);
        }
      } else if (typeof basicInfo.country === 'string') {
        // If it's a country code (2-3 characters) or name
        const countryQuery = basicInfo.country.length <= 3
          ? { $or: [
              { code: { $regex: new RegExp(`^${basicInfo.country}$`, 'i') } },
              { iso2: { $regex: new RegExp(`^${basicInfo.country}$`, 'i') } }
            ]}
          : { name: { $regex: new RegExp(`^${basicInfo.country}$`, 'i') } };
        
        const foundCountry = await Country.findOne(countryQuery);
        if (foundCountry) {
          countryId = foundCountry._id;
          console.log(`✅ Found country by ${basicInfo.country.length <= 3 ? 'code' : 'name'}: ${foundCountry.name} (${foundCountry.code})`);
        } else {
          console.warn(`⚠️ Country not found: ${basicInfo.country}`);
        }
      } else {
        console.warn(`⚠️ Unknown country format:`, basicInfo.country);
      }

      if (countryId) {
        agent.personalInfo.country = countryId;
        console.log(`✅ Updated country to: ${countryId}`);
      } else if (basicInfo.country === null || basicInfo.country === '') {
        agent.personalInfo.country = undefined;
        console.log(`✅ Cleared country`);
      } else {
        console.warn(`⚠️ Could not resolve country, keeping existing value`);
      }
    }

    // Update languages if provided
    if (basicInfo.languages !== undefined && Array.isArray(basicInfo.languages)) {
      agent.personalInfo.languages = basicInfo.languages.map((lang: any) => {
        if (typeof lang === 'object' && lang.language) {
          return {
            language: typeof lang.language === 'string' 
              ? new mongoose.Types.ObjectId(lang.language)
              : lang.language,
            proficiency: lang.proficiency || 'B2'
          };
        }
        return lang;
      });
      console.log(`✅ Updated languages: ${basicInfo.languages.length} languages`);
    }

    // Save the updated profile
    console.log(`💾 Saving updated profile...`);
    await agent.save();
    console.log(`✅ Profile saved successfully`);

    // Populate country and languages for response
    await agent.populate({
      path: 'personalInfo.country',
      select: 'name code'
    });
    await agent.populate({
      path: 'personalInfo.languages.language',
      select: 'name iso639_1'
    });

    return res.json({
      success: true,
      data: agent,
      message: 'Basic info updated successfully'
    });
  } catch (error: any) {
    console.error('❌ Error updating basic info:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update basic info'
    });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { id: userId } = req.params;
    
    // Convert userId to ObjectId if it's a valid ObjectId string
    let userIdQuery: any = userId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userIdQuery = new mongoose.Types.ObjectId(userId);
    } else {
      console.log('Invalid userId format:', userId);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    console.log('Searching for agent with userId:', userIdQuery);
    const agent = await Agent.findOne({ userId: userIdQuery })
      .populate({
        path: 'personalInfo.languages.language',
        select: 'name iso639_1'
      })
      .populate({
        path: 'professionalSummary.industries',
        select: 'name'
      })
      .populate({
        path: 'professionalSummary.activities',
        select: 'name'
      })
      .populate({
        path: 'skills.technical.skill',
        select: 'name category'
      })
      .populate({
        path: 'skills.professional.skill',
        select: 'name category'
      })
      .populate({
        path: 'skills.soft.skill',
        select: 'name category'
      })
      .populate({
        path: 'availability.timeZone',
        select: 'name offset'
      })
      .populate({
        path: 'personalInfo.country',
        select: 'name code'
      });
    
    if (!agent) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Initialize optionalActions if they are missing or empty (for existing profiles)
    if (!agent.onboardingProgress) {
      agent.onboardingProgress = {
        currentPhase: 1,
        phases: {
          phase1: { status: 'completed', requiredActions: {}, optionalActions: {} },
          phase2: { status: 'in_progress', requiredActions: {}, optionalActions: {} },
          phase3: { status: 'not_started', requiredActions: {}, optionalActions: {} },
          phase4: { status: 'not_started', requiredActions: {}, optionalActions: {} }
        },
        lastUpdated: new Date()
      };
    }
    
    // Ensure phase1 optionalActions are initialized
    if (!agent.onboardingProgress.phases.phase1.optionalActions || 
        Object.keys(agent.onboardingProgress.phases.phase1.optionalActions).length === 0) {
      agent.onboardingProgress.phases.phase1.optionalActions = {
        locationConfirmed: false,
        identityVerified: false,
        twoFactorEnabled: false
      };
    }
    
    // Ensure phase1 requiredActions are initialized
    if (!agent.onboardingProgress.phases.phase1.requiredActions || 
        Object.keys(agent.onboardingProgress.phases.phase1.requiredActions).length === 0) {
      agent.onboardingProgress.phases.phase1.requiredActions = {
        accountCreated: true,
        emailVerified: true
      };
    }
    
    // Ensure phase2 optionalActions are initialized
    if (!agent.onboardingProgress.phases.phase2.optionalActions || 
        Object.keys(agent.onboardingProgress.phases.phase2.optionalActions).length === 0) {
      agent.onboardingProgress.phases.phase2.optionalActions = {
        photoUploaded: false,
        bioCompleted: false
      };
    }
    
    // Ensure phase2 requiredActions are initialized
    if (!agent.onboardingProgress.phases.phase2.requiredActions || 
        Object.keys(agent.onboardingProgress.phases.phase2.requiredActions).length === 0) {
      agent.onboardingProgress.phases.phase2.requiredActions = {
        experienceAdded: false,
        skillsAdded: false,
        industriesAdded: false,
        activitiesAdded: false
      };
    }
    
    // Save the agent if we made changes to onboardingProgress
    try {
      await agent.save();
    } catch (saveError) {
      // If save fails, continue anyway - the data is still valid
      console.warn('Failed to save onboardingProgress updates:', saveError);
    }
    
    // Transform the data to match frontend expectations
    const agentData = agent.toObject();
    
    // Transform industries: extract names from populated objects or keep as strings
    if (agentData.professionalSummary?.industries) {
      agentData.professionalSummary.industries = agentData.professionalSummary.industries.map((ind: any) => {
        return typeof ind === 'string' ? ind : (ind.name || ind);
      });
    }
    
    // Transform activities: extract names from populated objects or keep as strings
    if (agentData.professionalSummary?.activities) {
      agentData.professionalSummary.activities = agentData.professionalSummary.activities.map((act: any) => {
        return typeof act === 'string' ? act : (act.name || act);
      });
    }
    
    // Transform skills: extract skill names from populated objects
    if (agentData.skills) {
      // Transform technical skills
      if (agentData.skills.technical) {
        agentData.skills.technical = agentData.skills.technical.map((skillRef: any) => {
          const skillName = skillRef.skill?.name || (typeof skillRef.skill === 'string' ? skillRef.skill : '');
          return {
            skill: skillName,
            level: skillRef.level || 1,
            details: skillRef.details || ''
          };
        });
      }
      
      // Transform professional skills
      if (agentData.skills.professional) {
        agentData.skills.professional = agentData.skills.professional.map((skillRef: any) => {
          const skillName = skillRef.skill?.name || (typeof skillRef.skill === 'string' ? skillRef.skill : '');
          return {
            skill: skillName,
            level: skillRef.level || 1,
            details: skillRef.details || ''
          };
        });
      }
      
      // Transform soft skills
      if (agentData.skills.soft) {
        agentData.skills.soft = agentData.skills.soft.map((skillRef: any) => {
          const skillName = skillRef.skill?.name || (typeof skillRef.skill === 'string' ? skillRef.skill : '');
          return {
            skill: skillName,
            level: skillRef.level || 1,
            details: skillRef.details || ''
          };
        });
      }
    }
    
    // Transform languages: extract language names from populated objects
    if (agentData.personalInfo?.languages) {
      agentData.personalInfo.languages = agentData.personalInfo.languages.map((lang: any) => {
        const languageName = lang.language?.name || (typeof lang.language === 'string' ? lang.language : '');
        return {
          language: languageName,
          proficiency: lang.proficiency || 'B1',
          _id: lang._id
        };
      });
    }
    
    return res.json({ success: true, data: agentData });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    // TODO: Implement update profile
    return res.json({ success: true, message: 'Not implemented' });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    // TODO: Implement delete profile
    return res.json({ success: true, message: 'Not implemented' });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id/skills', authenticate, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    // TODO: Implement update skills
    return res.json({ success: true, message: 'Not implemented' });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Configure multer for photo upload (using memory storage for Cloudinary)
const photoStorage = multer.memoryStorage();
const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload profile photo endpoint
router.put('/:id/photo', authenticate, photoUpload.single('photo'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await dbConnect();
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No photo file provided' });
    }

    // Check Cloudinary configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || cloudinary.v2.config().cloud_name;
    if (!cloudName) {
      console.error('Cloudinary not configured: CLOUDINARY_CLOUD_NAME is missing');
      return res.status(500).json({ 
        success: false, 
        error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.' 
      });
    }

    const { id } = req.params;
    console.log(`📸 Uploading photo for profile ID: ${id}`);
    
    // Find the agent profile
    let agent = await Agent.findById(id);
    if (!agent) {
      // Try to find by userId if id is not a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        console.error(`Profile not found with ID: ${id}`);
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }
      // Try finding by userId
      const userIdQuery = req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : null;
      if (!userIdQuery) {
        return res.status(401).json({ success: false, error: 'User ID not found' });
      }
      agent = await Agent.findOne({ userId: userIdQuery });
      if (!agent) {
        console.error(`Profile not found with userId: ${userIdQuery}`);
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }
    }

    console.log(`✅ Found agent profile: ${agent._id}`);

    // Delete old photo from Cloudinary if it exists
    if (agent.personalInfo?.photo?.publicId) {
      try {
        console.log(`🗑️ Deleting old photo: ${agent.personalInfo.photo.publicId}`);
        await deleteFromCloudinary(agent.personalInfo.photo.publicId);
        console.log(`✅ Old photo deleted successfully`);
      } catch (deleteError: any) {
        console.warn('⚠️ Error deleting old photo from Cloudinary:', deleteError?.message || deleteError);
        // Continue even if deletion fails
      }
    }

    // Upload to Cloudinary directly from buffer
    console.log(`☁️ Uploading to Cloudinary... (file size: ${req.file.size} bytes, mimetype: ${req.file.mimetype})`);
    
    // Verify Cloudinary is configured
    const cloudinaryConfig = cloudinary.v2.config();
    if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
      console.error('❌ Cloudinary configuration incomplete:', {
        has_cloud_name: !!cloudinaryConfig.cloud_name,
        has_api_key: !!cloudinaryConfig.api_key,
        has_api_secret: !!cloudinaryConfig.api_secret
      });
      return res.status(500).json({ 
        success: false, 
        error: 'Cloudinary is not properly configured. Please check your environment variables.' 
      });
    }
    
    // Check system time - Cloudinary requires time to be within 1 hour
    const systemTime = new Date();
    const systemTimeString = systemTime.toISOString();
    console.log(`🕐 System time: ${systemTimeString}`);
    
    // Get upload preset from environment or use unsigned upload
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    const useUnsignedUpload = !uploadPreset; // Use unsigned if no preset is configured
    
    // Warn if using signed uploads (requires system clock sync)
    if (!uploadPreset) {
      console.warn('⚠️ No upload preset configured. Using signed upload which requires system clock to be synced.');
      console.warn('💡 Consider setting CLOUDINARY_UPLOAD_PRESET to use unsigned uploads (more reliable).');
    }
    
    // Validate file buffer
    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.error('❌ File buffer is empty');
      return res.status(400).json({ 
        success: false, 
        error: 'File buffer is empty' 
      });
    }

    console.log(`📦 File size: ${req.file.buffer.length} bytes`);

    let uploadResult: cloudinary.UploadApiResponse;
    
    // If using unsigned upload preset, use REST API directly to avoid SDK signature requirements
    if (uploadPreset) {
      console.log(`📤 Using unsigned upload preset: ${uploadPreset}`);
      console.log(`📤 Uploading via REST API (bypassing SDK to avoid signature issues)`);
      
      // Convert buffer to data URI
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Use REST API directly for unsigned uploads (no SDK, no credentials needed)
      const axios = require('axios');
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      // Build form data for unsigned upload using multipart/form-data
      // For unsigned uploads, we can send the file directly as multipart
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Append the buffer directly (more efficient than data URI)
      formData.append('file', req.file.buffer, {
        filename: 'photo.jpg',
        contentType: req.file.mimetype
      });
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'profile-photos');
      
      // Note: Transformations can be applied via the upload preset settings in Cloudinary dashboard
      // Or we can apply them later via the URL. For now, upload without transformation to avoid errors.
      // If you need transformations, configure them in the upload preset settings in Cloudinary dashboard.
      
      console.log(`📤 Uploading to Cloudinary REST API:`, {
        url: uploadUrl,
        preset: uploadPreset,
        folder: 'profile-photos',
        fileSize: req.file.buffer.length,
        mimetype: req.file.mimetype
      });
      
      uploadResult = await Promise.race<cloudinary.UploadApiResponse>([
        axios.post(uploadUrl, formData, {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 90000
        }).then((response: any) => {
          console.log('✅ Upload successful via REST API:', response.data.secure_url);
          // Transform axios response to match Cloudinary SDK format
          return {
            secure_url: response.data.secure_url,
            public_id: response.data.public_id,
            url: response.data.url,
            ...response.data
          } as cloudinary.UploadApiResponse;
        }).catch((error: any) => {
          const errorDetails = {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
          };
          console.error('❌ REST API upload error:', errorDetails);
          
          // Create a more descriptive error
          let errorMessage = 'Failed to upload to Cloudinary';
          if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          const cloudinaryError = new Error(errorMessage);
          (cloudinaryError as any).http_code = error.response?.status || 500;
          (cloudinaryError as any).response = error.response?.data;
          throw cloudinaryError;
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Upload timeout: Request took longer than 90 seconds. Please try again or use a smaller image.'));
          }, 90000);
        })
      ]);
    } else {
      // For signed uploads, use SDK
      console.log(`📤 Using signed upload (system clock must be synced)`);
      
      const uploadOptions: any = {
        folder: 'profile-photos',
        resource_type: 'image',
        format: 'jpg',
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' }
        ]
      };

      // Convert buffer to data URI for more reliable upload
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Use Promise with timeout
      uploadResult = await Promise.race<cloudinary.UploadApiResponse>([
        cloudinary.v2.uploader.upload(dataUri, uploadOptions),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Upload timeout: Request took longer than 90 seconds. Please try again or use a smaller image.'));
          }, 90000); // 90 second timeout
        })
      ]);
    }

    // Update agent's photo
    if (!agent.personalInfo) {
      agent.personalInfo = {
        name: '',
        languages: []
      } as any;
    }

    agent.personalInfo.photo = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    };

    // Update onboarding progress
    if (agent.onboardingProgress?.phases?.phase2?.optionalActions) {
      agent.onboardingProgress.phases.phase2.optionalActions.photoUploaded = true;
      agent.onboardingProgress.lastUpdated = new Date();
    }

    console.log(`💾 Saving agent profile...`);
    await agent.save();
    console.log(`✅ Profile saved successfully`);

    return res.json({
      success: true,
      data: {
        photo: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        }
      },
      message: 'Photo uploaded successfully'
    });
  } catch (error: any) {
    console.error('❌ Error uploading photo:', {
      message: error.message,
      name: error.name,
      http_code: error.http_code,
      stack: error.stack,
      error: error
    });
    
    // Return more detailed error message
    let errorMessage = 'Failed to upload photo';
    const errorMsgLower = (error.message || '').toLowerCase();
    const isClockError = error.http_code === 400 && (
      errorMsgLower.includes('stale request') || 
      errorMsgLower.includes('clock') || 
      errorMsgLower.includes('time') ||
      errorMsgLower.includes('timestamp')
    );
    
    if (error.http_code === 499 || errorMsgLower.includes('timeout')) {
      errorMessage = 'Upload timeout: The upload took too long to complete. This may be due to network issues or a large file size. Please try again with a smaller image or check your network connection.';
      console.error('⏱️ Upload timeout detected.');
      console.error('💡 Suggestions: Use a smaller image file, check network connection, or try again later');
    } else if (isClockError) {
      errorMessage = 'System clock synchronization error. To fix this:\n\n' +
        'Option 1 (Recommended): Configure an unsigned upload preset:\n' +
        '  1. Go to Cloudinary Dashboard > Settings > Upload\n' +
        '  2. Create an "Unsigned" upload preset\n' +
        '  3. Add CLOUDINARY_UPLOAD_PRESET=your_preset_name to your .env file\n' +
        '  4. Restart the server\n\n' +
        'Option 2: Sync your system clock:\n' +
        '  - Windows: Run "w32tm /resync" in admin PowerShell\n' +
        '  - Linux/Mac: Use "sudo ntpdate -s time.nist.gov"';
      console.error('⏰ System clock synchronization issue detected.');
      console.error('💡 Recommended: Configure CLOUDINARY_UPLOAD_PRESET for unsigned uploads (no clock sync needed)');
      console.error('💡 Alternative: Sync your system time with an NTP server');
    } else if (error.http_code) {
      errorMessage = `Cloudinary error (${error.http_code}): ${error.message || 'Unknown error'}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name,
        http_code: error.http_code,
        systemTime: new Date().toISOString(),
        stack: error.stack
      } : undefined
    });
  }
});

// Configure multer for video upload (using memory storage for Cloudinary)
const videoStorage = multer.memoryStorage();
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Upload presentation video endpoint
router.put('/:id/video', authenticate, videoUpload.single('video'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await dbConnect();
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }

    // Check Cloudinary configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || cloudinary.v2.config().cloud_name;
    if (!cloudName) {
      console.error('Cloudinary not configured: CLOUDINARY_CLOUD_NAME is missing');
      return res.status(500).json({ 
        success: false, 
        error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.' 
      });
    }

    const { id } = req.params;
    console.log(`🎥 Uploading video for profile ID: ${id}`);
    
    // Find the agent profile
    let agent = await Agent.findById(id);
    if (!agent) {
      // Try to find by userId if id is not a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        console.error(`Profile not found with ID: ${id}`);
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }
      // Try finding by userId
      const userIdQuery = req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : null;
      if (!userIdQuery) {
        return res.status(401).json({ success: false, error: 'User ID not found' });
      }
      agent = await Agent.findOne({ userId: userIdQuery });
      if (!agent) {
        console.error(`Profile not found with userId: ${userIdQuery}`);
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }
    }

    console.log(`✅ Found agent profile: ${agent._id}`);

    // Delete old video from Cloudinary if it exists
    if (agent.personalInfo?.presentationVideo?.publicId) {
      try {
        console.log(`🗑️ Deleting old video: ${agent.personalInfo.presentationVideo.publicId}`);
        await deleteFromCloudinary(agent.personalInfo.presentationVideo.publicId);
        console.log(`✅ Old video deleted successfully`);
      } catch (deleteError: any) {
        console.warn('⚠️ Error deleting old video from Cloudinary:', deleteError?.message || deleteError);
        // Continue even if deletion fails
      }
    }

    // Upload to Cloudinary
    console.log(`☁️ Uploading video to Cloudinary... (file size: ${req.file.size} bytes, mimetype: ${req.file.mimetype})`);
    
    // Get upload preset from environment
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    let uploadResult: cloudinary.UploadApiResponse;
    
    // If using unsigned upload preset, use REST API directly
    if (uploadPreset) {
      console.log(`📤 Using unsigned upload preset: ${uploadPreset}`);
      console.log(`📤 Uploading video via REST API (bypassing SDK to avoid signature issues)`);
      
      // Use REST API directly for unsigned uploads
      const axios = require('axios');
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
      
      // Build form data for unsigned upload
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Append the buffer directly
      formData.append('file', req.file.buffer, {
        filename: 'presentation-video.mp4',
        contentType: req.file.mimetype
      });
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'presentation-videos');
      formData.append('resource_type', 'video');
      
      console.log(`📤 Uploading video to Cloudinary REST API:`, {
        url: uploadUrl,
        preset: uploadPreset,
        folder: 'presentation-videos',
        fileSize: req.file.buffer.length,
        mimetype: req.file.mimetype
      });
      
      uploadResult = await Promise.race<cloudinary.UploadApiResponse>([
        axios.post(uploadUrl, formData, {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 300000 // 5 minutes timeout for video uploads
        }).then((response: any) => {
          console.log('✅ Video upload successful via REST API:', response.data.secure_url);
          return {
            secure_url: response.data.secure_url,
            public_id: response.data.public_id,
            url: response.data.url,
            ...response.data
          } as cloudinary.UploadApiResponse;
        }).catch((error: any) => {
          const errorDetails = {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          };
          console.error('❌ REST API video upload error:', errorDetails);
          
          let errorMessage = 'Failed to upload video to Cloudinary';
          if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          const cloudinaryError = new Error(errorMessage);
          (cloudinaryError as any).http_code = error.response?.status || 500;
          (cloudinaryError as any).response = error.response?.data;
          throw cloudinaryError;
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Video upload timeout: Request took longer than 5 minutes. Please try again with a smaller video.'));
          }, 300000);
        })
      ]);
    } else {
      // For signed uploads, use SDK
      console.log(`📤 Using signed upload for video (system clock must be synced)`);
      
      const uploadOptions: any = {
        folder: 'presentation-videos',
        resource_type: 'video'
      };

      // Convert buffer to data URI
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      uploadResult = await Promise.race<cloudinary.UploadApiResponse>([
        cloudinary.v2.uploader.upload(dataUri, uploadOptions),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Video upload timeout: Request took longer than 5 minutes. Please try again with a smaller video.'));
          }, 300000);
        })
      ]);
    }

    // Update agent's video
    if (!agent.personalInfo) {
      agent.personalInfo = {
        name: '',
        languages: []
      } as any;
    }

    agent.personalInfo.presentationVideo = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    };

    // Update onboarding progress
    if (agent.onboardingProgress?.phases?.phase2?.optionalActions) {
      agent.onboardingProgress.phases.phase2.optionalActions.videoUploaded = true;
      agent.onboardingProgress.lastUpdated = new Date();
    }

    console.log(`💾 Saving agent profile with video...`);
    await agent.save();
    console.log(`✅ Profile saved successfully with video`);

    return res.json({
      success: true,
      data: {
        video: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        }
      },
      message: 'Video uploaded successfully'
    });
  } catch (error: any) {
    console.error('❌ Error uploading video:', {
      message: error.message,
      name: error.name,
      http_code: error.http_code,
      stack: error.stack,
      error: error
    });
    
    let errorMessage = 'Failed to upload video';
    if (error.http_code === 499 || error.message?.includes('timeout')) {
      errorMessage = 'Video upload timeout: The upload took too long to complete. Please try again with a smaller video or check your network connection.';
    } else if (error.http_code === 400 && (error.message?.includes('Stale request') || error.message?.includes('clock'))) {
      errorMessage = 'System clock synchronization error. Please configure CLOUDINARY_UPLOAD_PRESET for unsigned uploads.';
    } else if (error.http_code) {
      errorMessage = `Cloudinary error (${error.http_code}): ${error.message || 'Unknown error'}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name,
        http_code: error.http_code,
        systemTime: new Date().toISOString()
      } : undefined
    });
  }
});

export default router;
