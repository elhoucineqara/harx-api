import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChat extends Document {
  chatId: string;
  question?: string;
  chatInitiatedUrl?: string;
  departmentId?: string;
  departmentName?: string;
  endTime?: Date;
  crmInfo?: string;
  embedName?: string;
  visitorEmail?: string;
  notesAvailable?: boolean;
  visitorName?: string;
  countryCode?: string;
  embedId?: string;
  chatInitiatedTime?: Date;
  visitorIp?: string;
  missedTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>({
  chatId: { type: String, required: true },
  question: String,
  chatInitiatedUrl: String,
  departmentId: String,
  departmentName: String,
  endTime: Date,
  crmInfo: String,
  embedName: String,
  visitorEmail: String,
  notesAvailable: { type: Boolean, default: false },
  visitorName: String,
  countryCode: String,
  embedId: String,
  chatInitiatedTime: Date,
  visitorIp: String,
  missedTime: Date
}, { timestamps: true });

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);

export default Chat;

