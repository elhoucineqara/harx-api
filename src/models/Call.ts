import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IAgent } from './Agent';
import { ILead } from './Lead';

export interface ICall extends Document {
  sid?: string;
  parentCallSid?: string;
  agent: Types.ObjectId | IAgent;
  lead?: Types.ObjectId | ILead;
  phone_number?: string;
  direction: 'inbound' | 'outbound' | 'outbound-dial';
  status: 'initiated' | 'in-progress' | 'active' | 'completed' | 'missed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration: number;
  recording_url?: string;
  recording_url_cloudinary?: string;
  childCalls?: string[];
  notes?: string;
  tags?: string[];
  quality_score?: number;
  ai_call_score?: {
    "Agent fluency"?: { score: number; feedback: string };
    "Sentiment analysis"?: { score: number; feedback: string };
    "Fraud detection"?: { score: number; feedback: string };
    "overall"?: { score: number; feedback: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

const callSchema = new Schema<ICall>({
  sid: {
    type: String,
    unique: true,
    sparse: true
  },
  parentCallSid: String,
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  lead: {
    type: Schema.Types.ObjectId,
    ref: 'Lead'
  },
  phone_number: String,
  direction: {
    type: String,
    enum: ['inbound', 'outbound', 'outbound-dial'],
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'in-progress', 'active', 'completed', 'missed', 'failed'],
    default: 'active'
  },
  startTime: Date,
  endTime: Date,
  duration: {
    type: Number,
    default: 0
  },
  recording_url: String,
  recording_url_cloudinary: String,
  childCalls: [String],
  notes: String,
  tags: [{
    type: String
  }],
  quality_score: {
    type: Number,
    min: 0,
    max: 100
  },
  ai_call_score: {
    "Agent fluency": {
      score: { type: Number, min: 0, max: 100 },
      feedback: { type: String }
    },
    "Sentiment analysis": {
      score: { type: Number, min: 0, max: 100 },
      feedback: { type: String }
    },
    "Fraud detection": {
      score: { type: Number, min: 0, max: 100 },
      feedback: { type: String }
    },
    "overall": {
      score: { type: Number, min: 0, max: 100 },
      feedback: { type: String }
    }
  }
}, { timestamps: true });

// Note: pre-save middleware for updatedAt is handled by timestamps: true option, 
// but original schema had manual pre-save. Mongoose handles it with timestamps: true properly.

const Call: Model<ICall> = mongoose.models.Call || mongoose.model<ICall>('Call', callSchema);

export default Call;


