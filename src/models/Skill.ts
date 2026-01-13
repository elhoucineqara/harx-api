import mongoose from 'mongoose';

const ProfessionalSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: false },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

const TechnicalSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: false },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

const SoftSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: false },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export const ProfessionalSkill = mongoose.models.ProfessionalSkill || mongoose.model('ProfessionalSkill', ProfessionalSkillSchema);
export const TechnicalSkill = mongoose.models.TechnicalSkill || mongoose.model('TechnicalSkill', TechnicalSkillSchema);
export const SoftSkill = mongoose.models.SoftSkill || mongoose.model('SoftSkill', SoftSkillSchema);



