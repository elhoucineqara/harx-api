import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IReceivedMessage extends Document {
  userId: Types.ObjectId;
  from: string;
  text: string;
  timestamp: Date;
}

const receivedMessageSchema = new Schema<IReceivedMessage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const ReceivedMessage: Model<IReceivedMessage> = mongoose.models.ReceivedMessage || mongoose.model<IReceivedMessage>('ReceivedMessage', receivedMessageSchema);

export default ReceivedMessage;
