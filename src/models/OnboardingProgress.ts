import mongoose, { Schema, Document } from 'mongoose';

interface Step {
  id: number;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
  disabled?: boolean;
}

interface Phase {
  id: number;
  status: 'pending' | 'in_progress' | 'completed';
  steps: Step[];
}

export interface IOnboardingProgress extends Document {
  companyId: mongoose.Types.ObjectId;
  currentPhase: number;
  completedSteps: number[];
  phases: Phase[];
  updatedAt: Date;
}

const OnboardingProgressSchema: Schema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  currentPhase: {
    type: Number,
    default: 1
  },
  completedSteps: [{
    type: Number
  }],
  phases: [{
    id: Number,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    steps: [{
      id: Number,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      },
      completedAt: Date,
      disabled: Boolean
    }]
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour la date de modification - Modern async/await
OnboardingProgressSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

// Always delete cached model to force fresh compilation
if (mongoose.models.OnboardingProgress) {
  delete mongoose.models.OnboardingProgress;
}
if (mongoose.connection.models.OnboardingProgress) {
  delete (mongoose.connection.models as any).OnboardingProgress;
}

export default mongoose.model<IOnboardingProgress>('OnboardingProgress', OnboardingProgressSchema);



