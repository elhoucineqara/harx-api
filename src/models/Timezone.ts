import mongoose, { Document } from 'mongoose';

export interface ITimezone extends Document {
  countryCode: string;
  countryName: string;
  zoneName: string;
  gmtOffset: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const timezoneSchema = new mongoose.Schema<ITimezone>({
  countryCode: {
    type: String,
    required: true,
    uppercase: true,
    maxlength: 2
  },
  countryName: {
    type: String,
    required: true,
    trim: true
  },
  zoneName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  gmtOffset: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
timezoneSchema.index({ countryCode: 1 });
// Note: zoneName a déjà un index via 'unique: true'

export default mongoose.models.Timezone || mongoose.model<ITimezone>('Timezone', timezoneSchema);



