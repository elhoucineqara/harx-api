import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITelegramIntegration extends Document {
  userId: Types.ObjectId;
  botToken: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const telegramIntegrationSchema = new Schema<ITelegramIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  botToken: { type: String, required: true },
  status: { type: String, required: true }
}, { timestamps: true });

const TelegramIntegration: Model<ITelegramIntegration> = mongoose.models.TelegramIntegration || mongoose.model<ITelegramIntegration>('TelegramIntegration', telegramIntegrationSchema);

export default TelegramIntegration;
