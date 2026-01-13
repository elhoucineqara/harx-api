import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepProgress extends Document {
  repId: string;
  journeyId: string;
  moduleTotal: number;
  modules: Record<string, {
    status: string;
    progress: number;
    timeSpent: number;
    sections?: Record<string, {
      completed: boolean;
      progress: number;
      timeSpent: number;
      lastAccessed?: Date;
    }>;
    quizz?: Record<string, {
      quizId: string;
      score: number;
      passed: boolean;
      totalQuestions: number;
      correctAnswers: number;
      completedAt?: Date;
      attempts: number;
    }>;
    lastAccessed?: Date;
  }>;
  moduleFinished: number;
  moduleNotStarted: number;
  moduleInProgress: number;
  timeSpent: number;
  engagementScore: number;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
  _class?: string;
}

const repProgressSchema = new Schema<IRepProgress>({
  repId: { type: String, required: true },
  journeyId: { type: String, required: true },
  moduleTotal: { type: Number, required: true },
  modules: {
    type: Schema.Types.Mixed,
    default: {}
  },
  moduleFinished: { type: Number, default: 0 },
  moduleNotStarted: { type: Number, default: 0 },
  moduleInProgress: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  engagementScore: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now },
  _class: String
}, { timestamps: true });

const RepProgress: Model<IRepProgress> = mongoose.models.RepProgress || mongoose.model<IRepProgress>('RepProgress', repProgressSchema);

export default RepProgress;

