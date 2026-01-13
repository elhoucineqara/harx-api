import mongoose, { Document } from 'mongoose';

export interface ICompany extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  logo?: string;
  industry?: string;
  founded?: string;
  headquarters?: string;
  overview: string;
  companyIntro?: string;
  mission?: string;
  subscription: 'free' | 'standard' | 'premium';
  culture?: {
    values?: string[];
    benefits?: string[];
    workEnvironment?: string;
  };
  opportunities?: {
    roles?: string[];
    growthPotential?: string;
    training?: string;
  };
  technology?: {
    stack?: string[];
    innovation?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, default: null },
  name: { type: String, required: true },
  logo: String,
  industry: String,
  founded: String,
  headquarters: String,
  overview: { type: String, required: true },
  companyIntro: String,
  mission: String,
  subscription: {
    type: String,
    enum: ['free', 'standard', 'premium'],
    default: 'free'
  },
  culture: {
    values: [String],
    benefits: [String],
    workEnvironment: String
  },
  opportunities: {
    roles: [String],
    growthPotential: String,
    training: String
  },
  technology: {
    stack: [String],
    innovation: String
  },
  contact: {
    email: String,
    phone: String,
    address: String,
    website: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  }
}, {
  timestamps: true
});

export default mongoose.models.Company || mongoose.model('Company', companySchema);
