import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMailchimpIntegration extends Document {
  userId: Types.ObjectId;
  apiKey: string;
  accountInfo?: any;
  userInfo?: any;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mailchimpIntegrationSchema = new Schema<IMailchimpIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  apiKey: { type: String, required: true },
  accountInfo: { type: Schema.Types.Mixed, required: false },
  userInfo: { type: Schema.Types.Mixed, required: false },
  status: { type: String, required: true },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const MailchimpIntegration: Model<IMailchimpIntegration> = mongoose.models.MailchimpIntegration || mongoose.model<IMailchimpIntegration>('MailchimpIntegration', mailchimpIntegrationSchema);

export default MailchimpIntegration;
