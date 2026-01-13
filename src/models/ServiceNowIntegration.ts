import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IServiceNowIntegration extends Document {
  userId: Types.ObjectId;
  instanceUrl: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  accountInfo?: any;
  userInfo?: any;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const serviceNowIntegrationSchema = new Schema<IServiceNowIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  instanceUrl: { type: String, required: true },
  username: { type: String, required: false },
  password: { type: String, required: false },
  clientId: { type: String, required: false },
  clientSecret: { type: String, required: false },
  accountInfo: { type: Schema.Types.Mixed, required: false },
  userInfo: { type: Schema.Types.Mixed, required: false },
  status: { type: String, required: true },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const ServiceNowIntegration: Model<IServiceNowIntegration> = mongoose.models.ServiceNowIntegration || mongoose.model<IServiceNowIntegration>('ServiceNowIntegration', serviceNowIntegrationSchema);

export default ServiceNowIntegration;
