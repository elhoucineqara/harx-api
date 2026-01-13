import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFacebookIntegration extends Document {
  userId: Types.ObjectId;
  accessToken: string;
  pageAccessToken?: string;
  pageId?: string;
  status: string;
  lastSync?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const facebookIntegrationSchema = new Schema<IFacebookIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  accessToken: { type: String, required: true },
  pageAccessToken: { type: String },
  pageId: { type: String },
  status: { type: String, default: 'pending' },
  lastSync: { type: Date },
  error: { type: String }
}, { timestamps: true });

const FacebookIntegration: Model<IFacebookIntegration> = mongoose.models.FacebookIntegration || mongoose.model<IFacebookIntegration>('FacebookIntegration', facebookIntegrationSchema);

export default FacebookIntegration;
