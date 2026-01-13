import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISendgridIntegration extends Document {
  userId: Types.ObjectId;
  apiKey: string;
  accountInfo?: any;
  userInfo?: any;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sendgridIntegrationSchema = new Schema<ISendgridIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  apiKey: { type: String, required: true },
  accountInfo: { type: Schema.Types.Mixed, required: false },
  userInfo: { type: Schema.Types.Mixed, required: false },
  status: { type: String, required: true, default: 'connected' },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const SendgridIntegration: Model<ISendgridIntegration> = mongoose.models.SendgridIntegration || mongoose.model<ISendgridIntegration>('SendgridIntegration', sendgridIntegrationSchema);

export default SendgridIntegration;
