import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOutlookIntegration extends Document {
  userId: Types.ObjectId;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  accessToken: string;
  refreshToken: string;
  accountInfo?: any;
  userInfo?: any;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const outlookIntegrationSchema = new Schema<IOutlookIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  tenantId: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  accountInfo: { type: Schema.Types.Mixed, required: false },
  userInfo: { type: Schema.Types.Mixed, required: false },
  status: { type: String, required: true },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const OutlookIntegration: Model<IOutlookIntegration> = mongoose.models.OutlookIntegration || mongoose.model<IOutlookIntegration>('OutlookIntegration', outlookIntegrationSchema);

export default OutlookIntegration;
