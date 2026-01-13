import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IInstagramIntegration extends Document {
  userId: Types.ObjectId;
  accessToken?: string | null;
  igUserId?: string | null;
  businessAccountId?: string | null;
  username?: string;
  status: string;
  lastSync?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const instagramIntegrationSchema = new Schema<IInstagramIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  accessToken: { type: String },
  igUserId: { type: String },
  businessAccountId: { type: String },
  username: { type: String },
  status: { type: String, default: 'pending' },
  lastSync: { type: Date },
  error: { type: String }
}, { timestamps: true });

const InstagramIntegration: Model<IInstagramIntegration> = mongoose.models.InstagramIntegration || mongoose.model<IInstagramIntegration>('InstagramIntegration', instagramIntegrationSchema);

export default InstagramIntegration;
