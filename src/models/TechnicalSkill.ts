import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITechnicalSkill extends Document {
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

const technicalSkillSchema = new Schema<ITechnicalSkill>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Contact Center Software', 
      'CRM & Ticketing Systems', 
      'Live Chat Platforms', 
      'Email Management', 
      'Knowledge Management', 
      'Operating Systems & Office', 
      'Collaboration Tools', 
      'Typing & Productivity', 
      'Quality Assurance', 
      'Technical Support'
    ],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

const TechnicalSkill: Model<ITechnicalSkill> = mongoose.models.TechnicalSkill || mongoose.model<ITechnicalSkill>('TechnicalSkill', technicalSkillSchema);

export default TechnicalSkill;

