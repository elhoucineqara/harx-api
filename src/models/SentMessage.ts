import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISentMessage extends Document {
  userId: Types.ObjectId;
  to: string;
  text: string;
  timestamp: Date;
}

const sentMessageSchema = new Schema<ISentMessage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const SentMessage: Model<ISentMessage> = mongoose.models.SentMessage || mongoose.model<ISentMessage>('SentMessage', sentMessageSchema);

export default SentMessage;
