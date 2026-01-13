import mongoose, { Document } from 'mongoose';

export interface ISector extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SectorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Sector || mongoose.model('Sector', SectorSchema);



