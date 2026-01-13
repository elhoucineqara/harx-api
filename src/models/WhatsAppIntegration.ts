import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IWhatsAppIntegration extends Document {
  userId: Types.ObjectId;
  accessToken: string;
  businessId: string;
  phoneNumber: string;
  phoneNumberId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const whatsAppIntegrationSchema = new Schema<IWhatsAppIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  accessToken: { type: String, required: true },
  businessId: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  phoneNumberId: { type: String, required: true },
  status: { type: String, required: true }
}, { timestamps: true });

const WhatsAppIntegration: Model<IWhatsAppIntegration> = mongoose.models.WhatsAppIntegration || mongoose.model<IWhatsAppIntegration>('WhatsAppIntegration', whatsAppIntegrationSchema);

export default WhatsAppIntegration;

