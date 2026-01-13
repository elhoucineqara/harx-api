import mongoose, { Document } from 'mongoose';

export interface IFile extends Document {
  name: string;
  size: number;
  type: string;
  path: string;
  uploadedBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  metadata?: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

fileSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

// Always delete cached model to force fresh compilation
if (mongoose.models.File) {
  delete mongoose.models.File;
}
if (mongoose.connection.models.File) {
  delete (mongoose.connection.models as any).File;
}

export default mongoose.model('File', fileSchema);



