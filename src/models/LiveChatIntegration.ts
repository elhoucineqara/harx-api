import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILiveChatIntegration extends Document {
  userId: Types.ObjectId;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  accountId?: string;
  tokenExpiresAt?: Date;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const liveChatIntegrationSchema = new Schema<ILiveChatIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  accountId: { type: String, required: false },
  tokenExpiresAt: { type: Date, required: false },
  status: { type: String, required: true },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const LiveChatIntegration: Model<ILiveChatIntegration> = mongoose.models.LiveChatIntegration || mongoose.model<ILiveChatIntegration>('LiveChatIntegration', liveChatIntegrationSchema);

export default LiveChatIntegration;
