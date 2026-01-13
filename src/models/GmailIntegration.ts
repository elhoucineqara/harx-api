import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IGmailIntegration extends Document {
  userId: Types.ObjectId;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const gmailIntegrationSchema = new Schema<IGmailIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  refreshToken: { type: String, required: true },
  status: { type: String, default: 'connected' }
}, { timestamps: true });

const GmailIntegration: Model<IGmailIntegration> = mongoose.models.GmailIntegration || mongoose.model<IGmailIntegration>('GmailIntegration', gmailIntegrationSchema);

export default GmailIntegration;
