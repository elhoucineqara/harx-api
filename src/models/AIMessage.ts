import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAIMessage extends Document {
  callId: string;
  role: 'assistant' | 'system';
  content: string;
  category: 'suggestion' | 'alert' | 'info' | 'action';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  isProcessed: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const aiMessageSchema = new Schema<IAIMessage>({
  callId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['suggestion', 'alert', 'info', 'action'],
    default: 'suggestion'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'low'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

const AIMessage: Model<IAIMessage> = mongoose.models.AIMessage || mongoose.model<IAIMessage>('AIMessage', aiMessageSchema);

export default AIMessage;

