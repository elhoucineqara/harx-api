import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISalesforceIntegration extends Document {
  userId: Types.ObjectId;
  instanceUrl: string;
  accessToken: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  organizationId?: string;
  organizationName?: string;
  userInfo?: any;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const salesforceIntegrationSchema = new Schema<ISalesforceIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  instanceUrl: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  organizationId: { type: String, required: false },
  organizationName: { type: String, required: false },
  userInfo: { type: Schema.Types.Mixed, required: false },
  status: { type: String, required: true },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const SalesforceIntegration: Model<ISalesforceIntegration> = mongoose.models.SalesforceIntegration || mongoose.model<ISalesforceIntegration>('SalesforceIntegration', salesforceIntegrationSchema);

export default SalesforceIntegration;
