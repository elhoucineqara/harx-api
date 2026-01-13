import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOvhIntegration extends Document {
  userId: Types.ObjectId;
  applicationKey: string;
  applicationSecret: string;
  consumerKey: string;
  endpoint: string;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ovhIntegrationSchema = new Schema<IOvhIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  applicationKey: { type: String, required: true },
  applicationSecret: { type: String, required: true },
  consumerKey: { type: String, required: true },
  endpoint: { type: String, required: true },
  status: { type: String, default: 'active' },
  lastConnectionAt: { type: Date }
}, { timestamps: true });

const OvhIntegration: Model<IOvhIntegration> = mongoose.models.OvhIntegration || mongoose.model<IOvhIntegration>('OvhIntegration', ovhIntegrationSchema);

export default OvhIntegration;
