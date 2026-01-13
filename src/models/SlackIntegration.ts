import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISlackIntegration extends Document {
  userId: Types.ObjectId;
  botToken: string;
  appId: string;
  signingSecret: string;
  workspaceId?: string;
  teamName?: string;
  botUserId?: string;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const slackIntegrationSchema = new Schema<ISlackIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  botToken: { type: String, required: true },
  appId: { type: String, required: true },
  signingSecret: { type: String, required: true },
  workspaceId: { type: String, required: false },
  teamName: { type: String, required: false },
  botUserId: { type: String, required: false },
  status: { type: String, required: true, default: 'pending' },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const SlackIntegration: Model<ISlackIntegration> = mongoose.models.SlackIntegration || mongoose.model<ISlackIntegration>('SlackIntegration', slackIntegrationSchema);

export default SlackIntegration;
