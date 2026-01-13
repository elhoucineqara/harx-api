import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITeamsIntegration extends Document {
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

const teamsIntegrationSchema = new Schema<ITeamsIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  tenantId: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  accountInfo: { type: Schema.Types.Mixed, required: false },
  userInfo: { type: Schema.Types.Mixed, required: false },
  status: { type: String, required: true, default: 'pending' },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const TeamsIntegration: Model<ITeamsIntegration> = mongoose.models.TeamsIntegration || mongoose.model<ITeamsIntegration>('TeamsIntegration', teamsIntegrationSchema);

export default TeamsIntegration;
