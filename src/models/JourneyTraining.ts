import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJourneyTraining extends Document {
  title: string;
  description: string;
  industry?: string;
  status: string;
  companyId?: string;
  gigId?: string;
  modules?: Array<{
    _id: string;
    title: string;
    description: string;
    duration: number;
    difficulty: string;
    learningObjectives?: string[];
    prerequisites?: string[];
    topics?: string[];
    sections?: Array<{
      _id: string;
      title: string;
      type: string;
      order: number;
      content?: {
        text?: string;
        file?: {
          _id: string;
          name: string;
          type: string;
          url: string;
          publicId: string;
          size?: number;
          mimeType?: string;
        };
      };
      duration?: number;
    }>;
    quizzes?: Array<{
      _id: string;
      title: string;
      description?: string;
      questions?: Array<{
        _id: string;
        question: string;
        type: string;
        options: string[];
        correctAnswer: number | number[];
        explanation?: string;
        points?: number;
        orderIndex?: number;
      }>;
      passingScore?: number;
      timeLimit?: number;
      maxAttempts?: number;
      settings?: {
        shuffleQuestions?: boolean;
        shuffleOptions?: boolean;
        showCorrectAnswers?: boolean;
        allowReview?: boolean;
        showExplanations?: boolean;
      };
    }>;
    order?: number;
  }>;
  enrolledRepIds?: string[];
  launchDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  _class?: string;
}

const journeyTrainingSchema = new Schema<IJourneyTraining>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  industry: String,
  status: { type: String, default: 'active' },
  companyId: String,
  gigId: String,
  modules: [{
    _id: String,
    title: String,
    description: String,
    duration: Number,
    difficulty: String,
    learningObjectives: [String],
    prerequisites: [String],
    topics: [String],
    sections: [{
      _id: String,
      title: String,
      type: String,
      order: Number,
      content: {
        text: String,
        file: {
          _id: String,
          name: String,
          type: String,
          url: String,
          publicId: String,
          size: Number,
          mimeType: String
        }
      },
      duration: Number
    }],
    quizzes: [{
      _id: String,
      title: String,
      description: String,
      questions: [{
        _id: String,
        question: String,
        type: String,
        options: [String],
        correctAnswer: Schema.Types.Mixed,
        explanation: String,
        points: Number,
        orderIndex: Number
      }],
      passingScore: Number,
      timeLimit: Number,
      maxAttempts: Number,
      settings: {
        shuffleQuestions: Boolean,
        shuffleOptions: Boolean,
        showCorrectAnswers: Boolean,
        allowReview: Boolean,
        showExplanations: Boolean
      }
    }],
    order: Number
  }],
  enrolledRepIds: [String],
  launchDate: Date,
  _class: String
}, { timestamps: true });

const JourneyTraining: Model<IJourneyTraining> = mongoose.models.JourneyTraining || mongoose.model<IJourneyTraining>('JourneyTraining', journeyTrainingSchema);

export default JourneyTraining;

