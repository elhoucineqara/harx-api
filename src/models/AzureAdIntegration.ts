import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAzureAdIntegration extends Document {
  userId: Types.ObjectId;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const azureAdIntegrationSchema = new Schema<IAzureAdIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: String, required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  redirectUri: { type: String, required: true },
  accessToken: { type: String, required: false },
  refreshToken: { type: String, required: false },
  tokenExpiresAt: { type: Date, required: false },
  status: { type: String, required: true, default: 'pending' },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const AzureAdIntegration: Model<IAzureAdIntegration> = mongoose.models.AzureAdIntegration || mongoose.model<IAzureAdIntegration>('AzureAdIntegration', azureAdIntegrationSchema);

export default AzureAdIntegration;
