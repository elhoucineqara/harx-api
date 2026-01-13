import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFineTuningJob extends Omit<Document, 'model'> {
  jobId: string;
  model: string;
  baseModel: string;
  status: 'created' | 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'validating_files' | 'queued';
  fineTunedModel?: string;
  trainingFileId: string;
  validationFileId?: string;
  hyperparameters: {
    nEpochs: number;
    batchSize?: number;
    learningRateMultiplier?: number;
  };
  trainingDocuments?: string[];
  completedAt?: Date;
  error?: string;
  metrics?: {
    trainLoss?: number;
    validationLoss?: number;
    epochCount?: number;
  };
  description?: string;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const fineTuningJobSchema = new Schema<IFineTuningJob>({
  jobId: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  baseModel: { type: String, required: true },
  status: {
    type: String,
    enum: ['created', 'pending', 'running', 'succeeded', 'failed', 'cancelled', 'validating_files', 'queued'],
    default: 'created'
  },
  fineTunedModel: String,
  trainingFileId: { type: String, required: true },
  validationFileId: String,
  hyperparameters: {
    nEpochs: { type: Number, required: true },
    batchSize: Number,
    learningRateMultiplier: Number
  },
  trainingDocuments: [{ type: String, ref: 'Document' }],
  completedAt: Date,
  error: String,
  metrics: {
    trainLoss: Number,
    validationLoss: Number,
    epochCount: Number
  },
  description: String,
  companyId: String
}, { timestamps: true });

const FineTuningJob: Model<IFineTuningJob> = mongoose.models.FineTuningJob || mongoose.model<IFineTuningJob>('FineTuningJob', fineTuningJobSchema);

export default FineTuningJob;

