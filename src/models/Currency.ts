import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICurrency extends Document {
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const currencySchema = new Schema<ICurrency>({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Currency: Model<ICurrency> = mongoose.models.Currency || mongoose.model<ICurrency>('Currency', currencySchema);

export default Currency;
