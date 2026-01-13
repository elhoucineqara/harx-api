import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPhoneNumber extends Document {
  phoneNumber: string;
  telnyxId?: string;
  twilioId?: string;
  provider: 'telnyx' | 'twilio';
  orderId?: string;
  gigId?: Types.ObjectId;
  companyId?: Types.ObjectId;
  status: string;
  features?: {
    voice?: boolean;
    sms?: boolean;
    mms?: boolean;
  } | string[];
  createdAt: Date;
  updatedAt: Date;
}

const phoneNumberSchema = new Schema<IPhoneNumber>({
  phoneNumber: { type: String, required: true },
  telnyxId: String,
  twilioId: String,
  provider: { type: String, enum: ['telnyx', 'twilio'], required: true },
  orderId: String,
  gigId: { type: Schema.Types.ObjectId, ref: 'Gig' },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  status: { type: String, required: true },
  features: Schema.Types.Mixed // Can be object or array
}, { timestamps: true });

const PhoneNumber: Model<IPhoneNumber> = mongoose.models.PhoneNumber || mongoose.model<IPhoneNumber>('PhoneNumber', phoneNumberSchema);

export default PhoneNumber;

