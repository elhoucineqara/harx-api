import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIndustry extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const industrySchema = new Schema<IIndustry>({
  name: { type: String, required: true, unique: true },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Industry: Model<IIndustry> = mongoose.models.Industry || mongoose.model<IIndustry>('Industry', industrySchema);

export default Industry;
