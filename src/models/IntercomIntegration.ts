import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IIntercomIntegration extends Document {
  userId: Types.ObjectId;
  accessToken: string;
  appId?: string;
  workspaceId?: string;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const intercomIntegrationSchema = new Schema<IIntercomIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  accessToken: { type: String, required: true },
  appId: { type: String, required: false },
  workspaceId: { type: String, required: false },
  status: { type: String, required: true, default: 'pending' },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const IntercomIntegration: Model<IIntercomIntegration> = mongoose.models.IntercomIntegration || mongoose.model<IIntercomIntegration>('IntercomIntegration', intercomIntegrationSchema);

export default IntercomIntegration;
