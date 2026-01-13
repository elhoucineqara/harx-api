import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRingCentralIntegration extends Document {
  userId: Types.ObjectId;
  clientId: string;
  clientSecret: string;
  serverUrl: string;
  accessToken: string;
  refreshToken: string;
  accountInfo?: any;
  userInfo?: any;
  status: string;
  lastConnectionAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ringcentralIntegrationSchema = new Schema<IRingCentralIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  serverUrl: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  accountInfo: { type: Schema.Types.Mixed },
  userInfo: { type: Schema.Types.Mixed },  
  status: { type: String, required: true, default: 'connected' },
  lastConnectionAt: { type: Date }
}, { timestamps: true });

const RingCentralIntegration: Model<IRingCentralIntegration> = mongoose.models.RingCentralIntegration || mongoose.model<IRingCentralIntegration>('RingCentralIntegration', ringcentralIntegrationSchema);

export default RingCentralIntegration;
