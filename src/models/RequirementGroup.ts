import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRequirementGroup extends Document {
  companyId: Types.ObjectId;
  countryCode: string;
  status: string;
  requirements: Array<{
    field: string;
    type: string;
    value?: any;
    documentUrl?: string;
    status: string;
    rejectionReason?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const requirementGroupSchema = new Schema<IRequirementGroup>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  countryCode: { type: String, required: true },
  status: { type: String, required: true },
  requirements: [{
    field: { type: String, required: true },
    type: { type: String, required: true },
    value: Schema.Types.Mixed,
    documentUrl: String,
    status: { type: String, required: true },
    rejectionReason: String
  }]
}, { timestamps: true });

const RequirementGroup: Model<IRequirementGroup> = mongoose.models.RequirementGroup || mongoose.model<IRequirementGroup>('RequirementGroup', requirementGroupSchema);

export default RequirementGroup;

