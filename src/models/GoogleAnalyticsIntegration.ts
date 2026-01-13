import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IGoogleAnalyticsIntegration extends Document {
  userId: Types.ObjectId;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  tokenExpiresAt?: Date;
  viewId?: string;
  isGA4: boolean;
  measurementId?: string;
  apiSecret?: string;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const googleAnalyticsIntegrationSchema = new Schema<IGoogleAnalyticsIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  refreshToken: { type: String, required: true },
  accessToken: { type: String },
  tokenExpiresAt: { type: Date },
  viewId: { type: String },
  isGA4: { type: Boolean, default: false },
  measurementId: { type: String },
  apiSecret: { type: String },
  status: { type: String, default: 'disconnected' },
  lastConnectionAt: { type: Date }
}, { timestamps: true });

const GoogleAnalyticsIntegration: Model<IGoogleAnalyticsIntegration> = mongoose.models.GoogleAnalyticsIntegration || mongoose.model<IGoogleAnalyticsIntegration>('GoogleAnalyticsIntegration', googleAnalyticsIntegrationSchema);

export default GoogleAnalyticsIntegration;
