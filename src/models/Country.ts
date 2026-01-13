import mongoose, { Document } from 'mongoose';

export interface ICountry extends Document {
  name: {
    common: string;
    official: string;
    nativeName?: Map<string, { official: string; common: string }>;
  };
  cca2: string;
  flags: {
    png?: string;
    svg?: string;
    alt?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema = new mongoose.Schema(
  {
    name: {
      common: { type: String, required: true },
      official: { type: String, required: true },
      nativeName: {
        type: Map,
        of: {
          official: { type: String, required: true },
          common: { type: String, required: true }
        },
        required: false
      }
    },
    cca2: { 
      type: String, 
      required: true, 
      unique: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2
    },
    flags: {
      png: { type: String, required: false },
      svg: { type: String, required: false },
      alt: { type: String, required: false }
    }
  },
  { timestamps: true }
);

// Index pour améliorer les performances de recherche
CountrySchema.index({ 'name.common': 1 });
CountrySchema.index({ 'name.official': 1 });

export default mongoose.models.Country || mongoose.model('Country', CountrySchema);



