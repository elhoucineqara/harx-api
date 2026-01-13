import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISoftSkill extends Document {
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const softSkillSchema = new Schema<ISoftSkill>({
  name: { type: String, required: true, unique: true },
  description: String,
  category: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const SoftSkill: Model<ISoftSkill> = mongoose.models.SoftSkill || mongoose.model<ISoftSkill>('SoftSkill', softSkillSchema);

export default SoftSkill;
