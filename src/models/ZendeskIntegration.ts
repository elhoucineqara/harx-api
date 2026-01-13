import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IZendeskIntegration extends Document {
  userId: Types.ObjectId;
  subdomain: string;
  email: string;
  apiToken: string;
  accountInfo?: any;
  userInfo?: any;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const zendeskIntegrationSchema = new Schema<IZendeskIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subdomain: { type: String, required: true },
  email: { type: String, required: true },
  apiToken: { type: String, required: true },
  accountInfo: { type: Schema.Types.Mixed, required: false },
  userInfo: { type: Schema.Types.Mixed, required: false },
  status: { type: String, required: true },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const ZendeskIntegration: Model<IZendeskIntegration> = mongoose.models.ZendeskIntegration || mongoose.model<IZendeskIntegration>('ZendeskIntegration', zendeskIntegrationSchema);

export default ZendeskIntegration;
