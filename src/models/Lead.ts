import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILead extends Document {
  userId?: Types.ObjectId;
  companyId?: Types.ObjectId;
  gigId?: Types.ObjectId;
  Last_Activity_Time?: Date | null;
  Activity_Tag?: string;
  Deal_Name: string;
  Stage: string;
  Email_1?: string;
  Phone?: string;
  Telephony?: string;
  Pipeline?: string;
  name?: string;
  company?: string;
  value?: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  gigId: { type: Schema.Types.ObjectId, ref: 'Gig' },
  Last_Activity_Time: Date,
  Activity_Tag: String,
  Deal_Name: { type: String, required: true },
  Stage: { type: String, required: true },
  Email_1: String,
  Phone: String,
  Telephony: String,
  Pipeline: String,
  name: String,
  company: String,
  value: Number,
  metadata: Schema.Types.Mixed
}, { timestamps: true });

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema);

export default Lead;
