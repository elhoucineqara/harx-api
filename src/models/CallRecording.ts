import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICallRecording extends Document {
  contactId: string;
  date: Date;
  duration: number;
  recordingUrl: string;
  cloudinaryPublicId: string;
  summary?: string;
  analysis?: {
    transcription?: {
      status: string;
      segments?: Array<{
        start: string;
        end: string;
        speaker: string;
        text: string;
      }>;
      lastUpdated?: Date;
      error?: string | null;
    };
    status: string;
    summary?: {
      keyIdeas: Array<{
        title: string;
        description: string;
      }>;
      lastUpdated?: Date;
    };
    scoring?: {
      status: string;
      result?: {
        "Agent fluency"?: { score: number; feedback: string };
        "Sentiment analysis"?: { score: number; feedback: string };
        "Fraud detection"?: { score: number; feedback: string };
        "overall"?: { score: number; feedback: string };
      };
      lastUpdated?: Date;
      error?: string | null;
    };
    error?: string | null;
  };
  sentiment?: string;
  tags?: string[];
  aiInsights?: any[];
  repId?: string;
  companyId?: Types.ObjectId;
  processingOptions?: {
    transcription?: boolean;
    sentiment?: boolean;
    insights?: boolean;
  };
  audioState?: {
    isPlaying?: boolean;
    currentTime?: number;
    duration?: number;
    audioInstance?: any;
    showPlayer?: boolean;
    showTranscript?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const callRecordingSchema = new Schema<ICallRecording>({
  contactId: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  recordingUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  summary: String,
  analysis: {
    transcription: {
      status: String,
      segments: [{
        start: String,
        end: String,
        speaker: String,
        text: String
      }],
      lastUpdated: Date,
      error: Schema.Types.Mixed
    },
    status: String,
    summary: {
      keyIdeas: [{
        title: String,
        description: String
      }],
      lastUpdated: Date
    },
    scoring: {
      status: String,
      result: {
        "Agent fluency": {
          score: Number,
          feedback: String
        },
        "Sentiment analysis": {
          score: Number,
          feedback: String
        },
        "Fraud detection": {
          score: Number,
          feedback: String
        },
        "overall": {
          score: Number,
          feedback: String
        }
      },
      lastUpdated: Date,
      error: Schema.Types.Mixed
    },
    error: Schema.Types.Mixed
  },
  sentiment: String,
  tags: [String],
  aiInsights: [Schema.Types.Mixed],
  repId: String,
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  processingOptions: {
    transcription: Boolean,
    sentiment: Boolean,
    insights: Boolean
  },
  audioState: {
    isPlaying: Boolean,
    currentTime: Number,
    duration: Number,
    audioInstance: Schema.Types.Mixed,
    showPlayer: Boolean,
    showTranscript: Boolean
  }
}, { timestamps: true });

const CallRecording: Model<ICallRecording> = mongoose.models.CallRecording || mongoose.model<ICallRecording>('CallRecording', callRecordingSchema);

export default CallRecording;

