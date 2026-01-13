import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfessionalSkill extends Document {
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const professionalSkillSchema = new Schema<IProfessionalSkill>({
  name: { type: String, required: true, unique: true },
  description: String,
  category: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ProfessionalSkill: Model<IProfessionalSkill> = mongoose.models.ProfessionalSkill || mongoose.model<IProfessionalSkill>('ProfessionalSkill', professionalSkillSchema);

export default ProfessionalSkill;
