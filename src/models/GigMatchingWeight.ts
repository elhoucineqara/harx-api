import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IGigMatchingWeight extends Document {
  gigId: Types.ObjectId;
  matchingWeights: {
    experience?: number;
    skills?: number;
    industry?: number;
    languages?: number;
    availability?: number;
    timezone?: number;
    activities?: number;
    region?: number;
  };
  metadata?: {
    createdAt?: Date;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GigMatchingWeightSchema = new Schema<IGigMatchingWeight>({
  gigId: {
    type: Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
    unique: true,
  },
  matchingWeights: {
    experience: Number,
    skills: Number,
    industry: Number,
    languages: Number,
    availability: Number,
    timezone: Number,
    activities: Number,
    region: Number
  },
  metadata: {
    createdAt: Date,
    updatedAt: Date
  }
}, { timestamps: true });

const GigMatchingWeight: Model<IGigMatchingWeight> = mongoose.models.GigMatchingWeight || mongoose.model<IGigMatchingWeight>('GigMatchingWeight', GigMatchingWeightSchema);

export default GigMatchingWeight;


