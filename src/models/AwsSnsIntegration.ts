import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAwsSnsIntegration extends Document {
  userId: Types.ObjectId;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  defaultTopicArn?: string;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const awsSnsIntegrationSchema = new Schema<IAwsSnsIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  accessKeyId: { type: String, required: true },
  secretAccessKey: { type: String, required: true },
  region: { type: String, required: true, default: 'us-east-1' },
  defaultTopicArn: { type: String, required: false },
  status: { type: String, required: true, default: 'pending' },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const AwsSnsIntegration: Model<IAwsSnsIntegration> = mongoose.models.AwsSnsIntegration || mongoose.model<IAwsSnsIntegration>('AwsSnsIntegration', awsSnsIntegrationSchema);

export default AwsSnsIntegration;
