import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  phoneNumberId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>({
  phoneNumberId: { type: String, required: true, unique: true },
  status: { type: String, default: 'connected' }
}, { timestamps: true });

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema);

export default Client;
