import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IJiraIntegration extends Document {
  userId: Types.ObjectId;
  host: string;
  email: string;
  apiToken: string;
  projectKey?: string;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jiraIntegrationSchema = new Schema<IJiraIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  host: { type: String, required: true },
  email: { type: String, required: true },
  apiToken: { type: String, required: true },
  projectKey: { type: String, required: false },
  status: { type: String, required: true },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const JiraIntegration: Model<IJiraIntegration> = mongoose.models.JiraIntegration || mongoose.model<IJiraIntegration>('JiraIntegration', jiraIntegrationSchema);

export default JiraIntegration;
