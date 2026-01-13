import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITwilioIntegration extends Document {
  userId: Types.ObjectId;
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const twilioIntegrationSchema = new Schema<ITwilioIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  accountSid: { type: String, required: true },
  authToken: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  status: { type: String, required: true }
}, { timestamps: true });

const TwilioIntegration: Model<ITwilioIntegration> = mongoose.models.TwilioIntegration || mongoose.model<ITwilioIntegration>('TwilioIntegration', twilioIntegrationSchema);

export default TwilioIntegration;

