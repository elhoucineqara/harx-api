import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITelnyxRequirementGroup extends Document {
  telnyxId: string;
  companyId: string;
  destinationZone: string;
  status: string;
  requirements: Array<{
    requirementId: string;
    type: string;
    status: string;
    submittedValueId?: string;
    submittedAt?: Date;
    rejectionReason?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const telnyxRequirementGroupSchema = new Schema<ITelnyxRequirementGroup>({
  telnyxId: { type: String, required: true },
  companyId: { type: String, required: true },
  destinationZone: { type: String, required: true },
  status: { type: String, required: true },
  requirements: [{
    requirementId: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
    submittedValueId: { type: String },
    submittedAt: { type: Date },
    rejectionReason: { type: String }
  }]
}, { timestamps: true });

const TelnyxRequirementGroup: Model<ITelnyxRequirementGroup> = mongoose.models.TelnyxRequirementGroup || mongoose.model<ITelnyxRequirementGroup>('TelnyxRequirementGroup', telnyxRequirementGroupSchema);

export default TelnyxRequirementGroup;

