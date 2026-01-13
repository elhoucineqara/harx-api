import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IManualTraining extends Omit<Document, '_id'> {
  _id: string;
  companyId: string;
  title: string;
  description: string;
  metadata?: {
    category?: string;
    difficulty?: string;
    estimatedDuration?: number;
    tags?: string[];
    targetRoles?: string[];
    language?: string;
  };
  moduleIds?: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  _class?: string;
}

const manualTrainingSchema = new Schema<IManualTraining>({
  _id: { type: String, required: true },
  companyId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  metadata: {
    category: String,
    difficulty: String,
    estimatedDuration: Number,
    tags: [String],
    targetRoles: [String],
    language: String
  },
  moduleIds: [String],
  status: { type: String, default: 'draft' },
  _class: String
}, { timestamps: true, _id: false });

const ManualTraining: Model<IManualTraining> = mongoose.models.ManualTraining || mongoose.model<IManualTraining>('ManualTraining', manualTrainingSchema);

export default ManualTraining;

