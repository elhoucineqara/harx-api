import Agent, { IAgent } from '../models/Agent';
import Timezone from '../models/Timezone';
import { Types } from 'mongoose';
import dbConnect from '../lib/dbConnect';

class AgentService {
  private getPopulateOptions() {
    return [
      { path: 'availability.timeZone', model: 'Timezone' },
      { path: 'personalInfo.country', model: 'Timezone' },
      { path: 'personalInfo.languages.language', model: 'Language' },
      { path: 'skills.soft.skill', model: 'SoftSkill' },
      { path: 'skills.professional.skill', model: 'ProfessionalSkill' },
      { path: 'skills.technical.skill', model: 'TechnicalSkill' },
      { path: 'professionalSummary.industries', model: 'Industry' },
      { path: 'professionalSummary.activities', model: 'Activity' },
      {
        path: 'favoriteGigs',
        populate: [
          { path: 'activities' },
          { path: 'industries' },
          { path: 'skills.professional.skill', model: 'ProfessionalSkill' },
          { path: 'skills.technical.skill', model: 'TechnicalSkill' },
          { path: 'skills.soft.skill', model: 'SoftSkill' },
          { path: 'skills.languages.language', model: 'Language' },
          { path: 'availability.time_zone', model: 'Timezone' }
        ]
      }
    ];
  }

  async getProfile(userId: string) {
    await dbConnect();
    return Agent.findOne({ userId }).populate(this.getPopulateOptions());
  }

  async createProfile(userId: string, profileData: any) {
    await dbConnect();
    const existingProfile = await Agent.findOne({ userId });
    
    if (existingProfile) {
        // If it exists, we might want to update it or delete and recreate.
        // The original code deleted it.
        await Agent.deleteOne({ userId });
    }

    // Convert country code if needed
    if (profileData.personalInfo?.country && typeof profileData.personalInfo.country === 'string' && profileData.personalInfo.country.length <= 3) {
      const timezone = await Timezone.findOne({ countryCode: profileData.personalInfo.country.toUpperCase() });
      if (timezone) {
        profileData.personalInfo.country = timezone._id;
      }
    }

    const agent = new Agent({
      userId,
      ...profileData
    });

    await this.updateOnboardingProgress(agent);
    const savedAgent = await agent.save();
    return Agent.findById(savedAgent._id).populate(this.getPopulateOptions());
  }

  async updateProfile(id: string, profileData: any) {
    await dbConnect();
    
    // Convert country code if needed
    if (profileData.personalInfo?.country && typeof profileData.personalInfo.country === 'string' && profileData.personalInfo.country.length <= 3) {
      const timezone = await Timezone.findOne({ countryCode: profileData.personalInfo.country.toUpperCase() });
      if (timezone) {
        profileData.personalInfo.country = timezone._id;
      }
    }

    const agent = await Agent.findByIdAndUpdate(
      id,
      profileData,
      { new: true, runValidators: true }
    ).populate(this.getPopulateOptions());

    if (!agent) {
      throw new Error('Profile not found');
    }

    await this.updateOnboardingProgress(agent);
    await agent.save();

    return agent;
  }

  async deleteProfile(id: string) {
    await dbConnect();
    await Agent.findByIdAndDelete(id);
  }

  // Methods for AgentsController compatibility
  async getAllAgents() {
    await dbConnect();
    return Agent.find().populate('user', 'name email').populate(this.getPopulateOptions());
  }

  async getAgentById(id: string) {
    await dbConnect();
    return Agent.findById(id).populate('user', 'name email').populate(this.getPopulateOptions());
  }

  async createAgent(userId: string, agentData: any) {
    await dbConnect();
    const agent = new Agent({
      ...agentData,
      user: userId
    });
    return agent.save();
  }

  async updateAgent(id: string, agentData: any) {
    await dbConnect();
    return Agent.findByIdAndUpdate(id, agentData, {
      new: true,
      runValidators: true
    });
  }

  async deleteAgent(id: string) {
    await dbConnect();
    return Agent.findByIdAndDelete(id);
  }

  async updateAvailability(id: string, availabilityData: any) {
    await dbConnect();
    return Agent.findByIdAndUpdate(
      id,
      { availability: availabilityData },
      { new: true }
    );
  }

  async updateSkills(id: string, skills: any) {
    await dbConnect();
    return Agent.findByIdAndUpdate(
      id,
      { skills },
      { new: true }
    );
  }

  // Simplified Onboarding Progress Update logic
  async updateOnboardingProgress(agent: IAgent) {
    // Ensure structure exists
    if (!agent.onboardingProgress) {
        agent.onboardingProgress = {
            currentPhase: 1,
            phases: {
                phase1: { status: 'not_started', requiredActions: { accountCreated: true, emailVerified: true }, optionalActions: { locationConfirmed: false, identityVerified: false, twoFactorEnabled: false } },
                phase2: { status: 'not_started', requiredActions: { experienceAdded: false, skillsAdded: false, industriesAdded: false, activitiesAdded: false, availabilitySet: false, videoUploaded: false }, optionalActions: { photoUploaded: false, bioCompleted: false } },
                phase3: { status: 'not_started', requiredActions: { languageAssessmentDone: false, contactCenterAssessmentDone: false }, optionalActions: { technicalEvaluationDone: false, bestPracticesReviewed: false } },
                phase4: { status: 'not_started', requiredActions: { subscriptionActivated: false }, optionalActions: {} }
            },
            lastUpdated: new Date()
        };
    }

    const phases = agent.onboardingProgress.phases;

    // Phase 1: Account Creation
    // Assume account created and email verified for now (or check User model)
    phases.phase1.status = 'completed'; // Simplified for now
    phases.phase1.completedAt = phases.phase1.completedAt || new Date();

    // Phase 2: Profile Details
    const hasExperience = agent.experience && agent.experience.length > 0;
    const hasLanguages = agent.personalInfo?.languages && agent.personalInfo.languages.length > 0;
    const hasTechnicalSkills = agent.skills?.technical && agent.skills.technical.length > 0;
    const hasProfessionalSkills = agent.skills?.professional && agent.skills.professional.length > 0;
    const hasSoftSkills = agent.skills?.soft && agent.skills.soft.length > 0;
    const hasIndustries = agent.professionalSummary?.industries && agent.professionalSummary.industries.length > 0;
    const hasActivities = agent.professionalSummary?.activities && agent.professionalSummary.activities.length > 0;
    const hasAvailability = agent.availability?.schedule && agent.availability.schedule.length > 0 && !!agent.availability.timeZone;
    const hasVideo = !!agent.personalInfo?.presentationVideo?.url;

    phases.phase2.requiredActions.experienceAdded = hasExperience;
    phases.phase2.requiredActions.skillsAdded = hasLanguages && hasTechnicalSkills && hasProfessionalSkills && hasSoftSkills;
    phases.phase2.requiredActions.industriesAdded = hasIndustries;
    phases.phase2.requiredActions.activitiesAdded = hasActivities;
    phases.phase2.requiredActions.availabilitySet = hasAvailability;
    phases.phase2.requiredActions.videoUploaded = hasVideo;

    // Optional Phase 2
    phases.phase2.optionalActions.photoUploaded = !!agent.personalInfo?.photo?.url;
    phases.phase2.optionalActions.bioCompleted = !!agent.professionalSummary?.profileDescription;

    const phase2Completed = 
        phases.phase2.requiredActions.experienceAdded &&
        phases.phase2.requiredActions.skillsAdded &&
        phases.phase2.requiredActions.industriesAdded &&
        phases.phase2.requiredActions.activitiesAdded &&
        phases.phase2.requiredActions.availabilitySet &&
        phases.phase2.requiredActions.videoUploaded;

    if (phase2Completed) {
        phases.phase2.status = 'completed';
        phases.phase2.completedAt = phases.phase2.completedAt || new Date();
    } else {
        const phase2Started = 
            phases.phase2.requiredActions.experienceAdded ||
            phases.phase2.requiredActions.skillsAdded ||
            phases.phase2.requiredActions.industriesAdded ||
            phases.phase2.requiredActions.activitiesAdded ||
            phases.phase2.requiredActions.availabilitySet ||
            phases.phase2.requiredActions.videoUploaded;
        
        phases.phase2.status = phase2Started ? 'in_progress' : 'not_started';
        phases.phase2.completedAt = undefined;
    }

    // Phase 3: Assessments
    const hasLanguageAssessment = agent.personalInfo?.languages?.some((l: any) => l.assessmentResults);
    const hasContactCenterAssessment = agent.skills?.contactCenter?.some((s: any) => s.assessmentResults);

    phases.phase3.requiredActions.languageAssessmentDone = hasLanguageAssessment;
    phases.phase3.requiredActions.contactCenterAssessmentDone = hasContactCenterAssessment;

    const phase3Completed = hasLanguageAssessment && hasContactCenterAssessment;

    if (phase3Completed) {
        phases.phase3.status = 'completed';
        phases.phase3.completedAt = phases.phase3.completedAt || new Date();
    } else {
        const phase3Started = hasLanguageAssessment || hasContactCenterAssessment;
        phases.phase3.status = phase3Started ? 'in_progress' : (phases.phase2.status === 'completed' ? 'in_progress' : 'not_started');
        phases.phase3.completedAt = undefined;
    }

    // Phase 4: Subscription
    const hasActivePlan = !!agent.plan;
    phases.phase4.requiredActions.subscriptionActivated = hasActivePlan;

    if (hasActivePlan) {
        phases.phase4.status = 'completed';
        phases.phase4.completedAt = phases.phase4.completedAt || new Date();
    } else {
        phases.phase4.status = phases.phase3.status === 'completed' ? 'in_progress' : 'not_started';
        phases.phase4.completedAt = undefined;
    }

    // Update Current Phase
    if (phases.phase1.status !== 'completed') agent.onboardingProgress.currentPhase = 1;
    else if (phases.phase2.status !== 'completed') agent.onboardingProgress.currentPhase = 2;
    else if (phases.phase3.status !== 'completed') agent.onboardingProgress.currentPhase = 3;
    else if (phases.phase4.status !== 'completed') agent.onboardingProgress.currentPhase = 4;
    else agent.onboardingProgress.currentPhase = 4;

    agent.onboardingProgress.lastUpdated = new Date();
  }
}

export { AgentService };
export const agentService = new AgentService();

