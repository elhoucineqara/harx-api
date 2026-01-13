import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITwitterIntegration extends Document {
  userId: Types.ObjectId;
  apiKey?: string;
  apiKeySecret?: string;
  accessToken: string;
  accessTokenSecret?: string;
  bearerToken?: string;
  twitterUserId?: string;
  screenName?: string;
  status: string;
  lastSync?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const twitterIntegrationSchema = new Schema<ITwitterIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  apiKey: { type: String },
  apiKeySecret: { type: String },
  accessToken: { type: String, required: true },
  accessTokenSecret: { type: String },
  bearerToken: { type: String },
  twitterUserId: { type: String },
  screenName: { type: String },
  status: { type: String, default: 'pending' },
  lastSync: { type: Date },
  error: { type: String }
}, { timestamps: true });

const TwitterIntegration: Model<ITwitterIntegration> = mongoose.models.TwitterIntegration || mongoose.model<ITwitterIntegration>('TwitterIntegration', twitterIntegrationSchema);

export default TwitterIntegration;
