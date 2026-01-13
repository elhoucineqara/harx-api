import mongoose, { Schema, Document as MongooseDocument, Model, Types } from 'mongoose';

export interface IDocument extends MongooseDocument {
  name: string;
  description?: string;
  fileUrl: string;
  cloudinaryPublicId: string;
  fileType: string;
  type?: string;
  content?: string;
  tags?: string[];
  uploadedBy?: string;
  companyId?: Types.ObjectId;
  isProcessed?: boolean;
  processingStatus?: string;
  chunks?: Array<{
    content: string;
    index: number;
  }>;
  metadata?: {
    wordCount?: number;
    characterCount?: number;
    sentenceCount?: number;
    paragraphCount?: number;
    createdAt?: Date;
    modifiedAt?: Date;
  };
  analysis?: {
    summary?: string;
    domain?: string;
    theme?: string;
    mainPoints?: string[];
    technicalLevel?: string;
    targetAudience?: string;
    keyTerms?: string[];
    recommendations?: string[];
    analyzedAt?: Date;
  };
  uploadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>({
  name: { type: String, required: true },
  description: String,
  fileUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  fileType: { type: String, required: true },
  type: String,
  content: String,
  tags: [String],
  uploadedBy: String,
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  isProcessed: { type: Boolean, default: false },
  processingStatus: { type: String, default: 'pending' },
  chunks: [{
    content: String,
    index: Number
  }],
  metadata: {
    wordCount: Number,
    characterCount: Number,
    sentenceCount: Number,
    paragraphCount: Number,
    createdAt: Date,
    modifiedAt: Date
  },
  analysis: {
    summary: String,
    domain: String,
    theme: String,
    mainPoints: [String],
    technicalLevel: String,
    targetAudience: String,
    keyTerms: [String],
    recommendations: [String],
    analyzedAt: Date
  },
  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Document: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema);

export default Document;

