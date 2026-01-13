import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILanguage extends Document {
  code: string;
  name: string;
  nativeName?: string;
  createdAt: Date;
  updatedAt: Date;
  lastUpdated?: Date;
}

const languageSchema = new Schema<ILanguage>({
  code: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  nativeName: String,
  lastUpdated: Date
}, { timestamps: true });

const Language: Model<ILanguage> = mongoose.models.Language || mongoose.model<ILanguage>('Language', languageSchema);

export default Language;
