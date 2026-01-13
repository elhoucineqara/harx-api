import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IScript extends Document {
  gigId: Types.ObjectId;
  gig?: any;
  targetClient?: string;
  language?: string;
  details?: string;
  script: Array<{
    phase: string;
    actor: 'agent' | 'lead';
    replica: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const scriptSchema = new Schema<IScript>({
  gigId: { type: Schema.Types.ObjectId, ref: 'Gig', required: true },
  targetClient: String,
  language: String,
  details: String,
  script: [{
    phase: String,
    actor: { type: String, enum: ['agent', 'lead'], required: true },
    replica: { type: String, required: true }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Script: Model<IScript> = mongoose.models.Script || mongoose.model<IScript>('Script', scriptSchema);

export default Script;

