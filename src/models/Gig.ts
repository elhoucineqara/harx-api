import mongoose, { Document } from 'mongoose';

export interface IGig extends Document {
  title?: string;
  description?: string;
  category?: string;
  userId?: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  destination_zone?: mongoose.Types.ObjectId;
  sectors?: any[];
  activities?: mongoose.Types.ObjectId[];
  industries?: mongoose.Types.ObjectId[];
  seniority?: {
    level?: string;
    yearsExperience?: string;
  };
  skills?: {
    professional?: Array<{
      skill?: mongoose.Types.ObjectId;
      level?: number;
      details?: string;
    }>;
    technical?: Array<{
      skill?: mongoose.Types.ObjectId;
      level?: number;
      details?: string;
    }>;
    soft?: Array<{
      skill?: mongoose.Types.ObjectId;
      level?: number;
      details?: string;
    }>;
    languages?: Array<{
      language?: mongoose.Types.ObjectId;
      proficiency?: string;
      iso639_1?: string;
    }>;
  };
  availability?: {
    schedule?: Array<{
      day?: string;
      hours?: {
        start?: string;
        end?: string;
      };
    }>;
    time_zone?: mongoose.Types.ObjectId;
    flexibility?: string[];
    minimumHours?: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
  commission?: {
    base?: string;
    baseAmount?: number;
    bonus?: string;
    bonusAmount?: number;
    currency?: mongoose.Types.ObjectId;
    minimumVolume?: {
      amount?: number;
      period?: string;
      unit?: string;
    };
    transactionCommission?: {
      type?: string;
      amount?: number;
    };
  };
  team?: {
    size?: number;
    structure?: any[];
    territories?: string[];
  };
  documentation?: {
    product?: Array<{
      name?: string;
      url?: string;
    }>;
    process?: Array<{
      name?: string;
      url?: string;
    }>;
    training?: Array<{
      name?: string;
      url?: string;
    }>;
  };
  highlights?: string[];
  deliverables?: string[];
  status: 'to_activate' | 'active' | 'inactive' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const GigSchema = new mongoose.Schema(
  {
    title: { type: String, required: false },
    description: { type: String, required: false },
    category: { type: String, required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    // Reference to Country model - will be populated
    destination_zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: false },
    sectors: [{ type: mongoose.Schema.Types.Mixed, required: false }],
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: false }],
    industries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: false }],
    seniority: {
      level: { type: String, required: false },
      yearsExperience: { type: String, required: false },
    },
    skills: {
      professional: [{
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'ProfessionalSkill', required: false },
        level: { type: Number, required: false },
        details: { type: String, required: false }
      }],
      technical: [{
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'TechnicalSkill', required: false },
        level: { type: Number, required: false },
        details: { type: String, required: false }
      }],
      soft: [{
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'SoftSkill', required: false },
        level: { type: Number, required: false },
        details: { type: String, required: false }
      }],
      languages: [{
        language: { type: mongoose.Schema.Types.ObjectId, ref: 'Language', required: false },
        proficiency: { type: String, required: false },
        iso639_1: { type: String, required: false }
      }]
    },
    availability: {
      schedule: [{
        day: { type: String, required: false },
        hours: {
          start: { type: String, required: false },
          end: { type: String, required: false }
        }
      }],
      time_zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Timezone', required: false },
      flexibility: [{ type: String }],
      minimumHours: {
        daily: { type: Number, required: false },
        weekly: { type: Number, required: false },
        monthly: { type: Number, required: false }
      }
    },
    commission: {
      base: { type: String, required: false },
      baseAmount: { type: String, required: false },
      bonus: String,
      bonusAmount: String,
      structure: String,
      currency: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency', required: false },
      minimumVolume: {
        amount: { type: String, required: false },
        period: { type: String, required: false },
        unit: { type: String, required: false },
      },
      transactionCommission: {
        type: { type: String, required: false },
        amount: { type: String, required: false },
      },
      additionalDetails: { type: String, required: false },
    },
    leads: {
      types: [
        {
          type: { type: String, enum: ['hot', 'warm', 'cold'] },
          percentage: Number,
          description: String,
          conversionRate: Number,
        },
      ],
      sources: [{ type: String }],
    },
    team: {
      size: { type: String, required: false },
      structure: [
        {
          roleId: String,
          count: Number,
          seniority: {
            level: String,
            yearsExperience: String,
          },
        },
      ],
      territories: [{ type: String, required: false }],
    },
    documentation: {
      product: [
        {
          name: { type: String, required: false },
          url: { type: String, required: false },
        },
      ],
      process: [
        {
          name: { type: String, required: false },
          url: { type: String, required: false },
        },
      ],
      training: [
        {
          name: { type: String, required: false },
          url: { type: String, required: false },
        },
      ],
    },
    highlights: [{ type: String, required: false }],
    deliverables: [{ type: String, required: false }],
    status: { 
      type: String, 
      enum: ['to_activate', 'active', 'inactive', 'archived'], 
      default: 'to_activate',
      required: true 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Gig || mongoose.model('Gig', GigSchema);
