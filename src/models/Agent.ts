import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './User';
import { IPlan } from './Plan';
import { ITimezone } from './Timezone';
import { IIndustry } from './Industry';
import { IActivity } from './Activity';
import { ILanguage } from './Language';
import { ITechnicalSkill } from './TechnicalSkill';
import { IProfessionalSkill } from './ProfessionalSkill';
import { ISoftSkill } from './SoftSkill';
import { IGig } from './Gig';

// Helper interfaces for subdocuments
interface ILanguageAssessmentResult {
  completeness?: { score: number; feedback: string };
  fluency?: { score: number; feedback: string };
  proficiency?: { score: number; feedback: string };
  overall?: { score: number; strengths: string; areasForImprovement: string };
  completedAt?: Date;
}

interface IContactCenterAssessment {
  category: string;
  skill: string;
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
  tips: string[];
  keyMetrics: {
    professionalism: number;
    effectiveness: number;
    customerFocus: number;
  };
  completedAt?: Date;
}

interface IAgentLanguage {
  language: Types.ObjectId | ILanguage;
  proficiency: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  assessmentResults?: ILanguageAssessmentResult;
}

interface ISkillRef {
  skill: Types.ObjectId;
  level: number;
  details?: string;
}

interface IContactCenterSkill {
  skill: string;
  category: string;
  proficiency: 'Expert' | 'Advanced' | 'Intermediate' | 'Basic' | 'Novice';
  assessmentResults?: IContactCenterAssessment;
}

interface IAchievement {
  description: string;
  impact?: string;
  context?: string;
  skills?: string[];
}

interface IExperience {
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date | string; // 'present' or Date
  responsibilities?: string[];
  achievements?: string[];
}

interface IOnboardingPhase {
  status: 'not_started' | 'in_progress' | 'completed';
  requiredActions: Record<string, boolean>;
  optionalActions: Record<string, boolean>;
  completedAt?: Date;
}

interface IOnboardingProgress {
  currentPhase: number;
  phases: {
    phase1: IOnboardingPhase;
    phase2: IOnboardingPhase;
    phase3: IOnboardingPhase;
    phase4: IOnboardingPhase;
  };
  lastUpdated: Date;
}

interface IAvailability {
  schedule: Array<{
    day: string;
    hours: {
      start: string;
      end: string;
    };
  }>;
  timeZone?: Types.ObjectId | ITimezone;
  flexibility?: string[];
}

interface IPerformance {
  success_rate: number;
  calls_handled: number;
  customer_satisfaction: number;
  avg_duration?: number;
}

interface IPersonalInfo {
  name: string;
  country?: Types.ObjectId | ITimezone; // Using Timezone as country ref as per schema? Or maybe Country model? Original schema says ref: 'Timezone' for country field? 
  // Wait, original schema says: country: { type: mongoose.Schema.Types.ObjectId, ref: 'Timezone' } in personalInfo.
  // That seems odd, usually country ref is Country. But I'll follow the schema.
  city?: string;
  email?: string;
  phone?: string;
  photo?: {
    url: string;
    publicId: string;
  };
  presentationVideo?: {
    url: string;
    publicId: string;
    duration?: number;
    recordedAt?: Date;
  };
  languages: IAgentLanguage[];
}

interface IProfessionalSummary {
  yearsOfExperience: number;
  currentRole?: string;
  industries: Types.ObjectId[] | IIndustry[];
  activities: Types.ObjectId[] | IActivity[];
  keyExpertise: string[];
  notableCompanies: string[];
  profileDescription: string;
}

interface ISkills {
  technical: ISkillRef[];
  professional: ISkillRef[];
  soft: ISkillRef[];
  contactCenter: IContactCenterSkill[];
}

export interface IAgent extends Document {
  userId: Types.ObjectId | IUser;
  plan?: Types.ObjectId | IPlan;
  status: 'draft' | 'in_progress' | 'completed';
  isBasicProfileCompleted: boolean;
  onboardingProgress: IOnboardingProgress;
  availability: IAvailability;
  personalInfo: IPersonalInfo;
  professionalSummary: IProfessionalSummary;
  skills: ISkills;
  performance: IPerformance;
  rating: number;
  name: string;
  achievements: IAchievement[];
  experience: IExperience[];
  lastUpdated: Date;
  favoriteGigs: Types.ObjectId[] | IGig[];
  gigs?: Array<{
    gigId: Types.ObjectId;
    status: string;
    enrollmentDate?: Date;
    invitationDate?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const languageAssessmentResultsSchema = new Schema({
  completeness: {
    score: { type: Number, min: 0, max: 100 },
    feedback: String
  },
  fluency: {
    score: { type: Number, min: 0, max: 100 },
    feedback: String
  },
  proficiency: {
    score: { type: Number, min: 0, max: 100 },
    feedback: String
  },
  overall: {
    score: { type: Number, min: 0, max: 100 },
    strengths: String,
    areasForImprovement: String
  },
  completedAt: { type: Date, default: Date.now }
}, { _id: false });

const contactCenterAssessmentSchema = new Schema({
  category: {
    type: String,
    required: true,
    enum: ['Communication', 'Problem Solving', 'Customer Service']
  },
  skill: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  strengths: [{ type: String, required: true }],
  improvements: [{ type: String, required: true }],
  feedback: { type: String, required: true },
  tips: [{ type: String, required: true }],
  keyMetrics: {
    professionalism: { type: Number, required: true, min: 0, max: 10 },
    effectiveness: { type: Number, required: true, min: 0, max: 10 },
    customerFocus: { type: Number, required: true, min: 0, max: 10 }
  },
  completedAt: { type: Date, default: Date.now }
});

const languageSchema = new Schema({
  language: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
  proficiency: { 
    type: String, 
    required: true,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  assessmentResults: languageAssessmentResultsSchema
});

const technicalSkillRefSchema = new Schema({
  skill: { type: Schema.Types.ObjectId, ref: 'TechnicalSkill', required: true },
  level: { type: Number, required: true, min: 0, max: 5 },
  details: String
}, { _id: false });

const professionalSkillRefSchema = new Schema({
  skill: { type: Schema.Types.ObjectId, ref: 'ProfessionalSkill', required: true },
  level: { type: Number, required: true, min: 0, max: 5 },
  details: String
}, { _id: false });

const softSkillRefSchema = new Schema({
  skill: { type: Schema.Types.ObjectId, ref: 'SoftSkill', required: true },
  level: { type: Number, required: true, min: 0, max: 5 },
  details: String
}, { _id: false });

const achievementSchema = new Schema({
  description: { type: String, required: true },
  impact: { type: String },
  context: { type: String },
  skills: [String]
});

const experienceSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Schema.Types.Mixed }, // Date or 'present'
  responsibilities: [{ type: String }],
  achievements: [{ type: String }]
});

const contactCenterSkillSchema = new Schema({
  skill: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Communication', 'Problem Solving', 'Customer Service']
  },
  proficiency: {
    type: String,
    required: true,
    enum: ['Expert', 'Advanced', 'Intermediate', 'Basic', 'Novice']
  },
  assessmentResults: {
    score: { type: Number, required: true, min: 0, max: 100 },
    strengths: [{ type: String, required: true }],
    improvements: [{ type: String, required: true }],
    feedback: { type: String, required: true },
    tips: [{ type: String, required: true }],
    keyMetrics: {
      professionalism: { type: Number, required: true, min: 0, max: 100 },
      effectiveness: { type: Number, required: true, min: 0, max: 100 },
      customerFocus: { type: Number, required: true, min: 0, max: 100 }
    },
    completedAt: { type: Date, default: Date.now }
  }
}, { _id: false });

const agentSchema = new Schema<IAgent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
  status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
  isBasicProfileCompleted: { type: Boolean, default: false },
  onboardingProgress: {
    currentPhase: { type: Number, default: 1, min: 1 },
    phases: {
      phase1: {
        status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
        requiredActions: {
          accountCreated: { type: Boolean, default: true },
          emailVerified: { type: Boolean, default: true }
        },
        optionalActions: {
          locationConfirmed: { type: Boolean, default: false },
          identityVerified: { type: Boolean, default: false },
          twoFactorEnabled: { type: Boolean, default: false }
        },
        completedAt: { type: Date }
      },
      phase2: {
        status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
        requiredActions: {
          experienceAdded: { type: Boolean, default: false },
          skillsAdded: { type: Boolean, default: false },
          industriesAdded: { type: Boolean, default: false },
          activitiesAdded: { type: Boolean, default: false },
          availabilitySet: { type: Boolean, default: false },
          videoUploaded: { type: Boolean, default: false }
        },
        optionalActions: {
          photoUploaded: { type: Boolean, default: false },
          bioCompleted: { type: Boolean, default: false }
        },
        completedAt: { type: Date }
      },
      phase3: {
        status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
        requiredActions: {
          languageAssessmentDone: { type: Boolean, default: false },
          contactCenterAssessmentDone: { type: Boolean, default: false }
        },
        optionalActions: {
          technicalEvaluationDone: { type: Boolean, default: false },
          bestPracticesReviewed: { type: Boolean, default: false }
        },
        completedAt: { type: Date }
      },
      phase4: {
        status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
        requiredActions: {
          subscriptionActivated: { type: Boolean, default: false }
        },
        optionalActions: {},
        completedAt: { type: Date }
      }
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  availability: {
    schedule: [{
      day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      hours: {
        start: { type: String },
        end: { type: String }
      }
    }],
    timeZone: { type: Schema.Types.ObjectId, ref: 'Timezone' },
    flexibility: [{ type: String }]
  },
  personalInfo: {
    name: String,
    country: { type: Schema.Types.ObjectId, ref: 'Timezone' },
    city: String,
    email: String,
    phone: String,
    photo: {
      url: String,
      publicId: String
    },
    presentationVideo: {
      url: String,
      publicId: String,
      duration: Number,
      recordedAt: { type: Date, default: Date.now }
    },
    languages: [languageSchema]
  },
  professionalSummary: {
    yearsOfExperience: { type: Number, min: 0, max: 50 },
    currentRole: String,
    industries: [{ type: Schema.Types.ObjectId, ref: 'Industry' }],
    activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
    keyExpertise: [String],
    notableCompanies: [String],
    profileDescription: { type: String, default: '' }
  },
  skills: {
    technical: [technicalSkillRefSchema],
    professional: [professionalSkillRefSchema],
    soft: [softSkillRefSchema],
    contactCenter: [contactCenterSkillSchema]
  },
  performance: {
    success_rate: { type: Number, default: 0 },
    calls_handled: { type: Number, default: 0 },
    customer_satisfaction: { type: Number, default: 0 },
    avg_duration: { type: Number, default: 0 }
  },
  rating: { type: Number, default: 0 },
  name: { type: String },
  achievements: [achievementSchema],
  experience: [experienceSchema],
  lastUpdated: { type: Date, default: Date.now },
  favoriteGigs: [{ type: Schema.Types.ObjectId, ref: 'Gig' }],
  gigs: [{
    gigId: { type: Schema.Types.ObjectId, ref: 'Gig' },
    gigAgentId: { type: Schema.Types.ObjectId, ref: 'GigAgent' },
    status: { type: String, enum: ['enrolled', 'requested', 'pending', 'rejected'], default: 'pending' },
    enrollmentDate: Date,
    invitationDate: Date,
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Agent: Model<IAgent> = mongoose.models.Agent || mongoose.model<IAgent>('Agent', agentSchema);

export default Agent;

