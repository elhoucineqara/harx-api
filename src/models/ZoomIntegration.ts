import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IZoomIntegration extends Document {
  userId: Types.ObjectId;
  clientId: string;
  clientSecret: string;
  accountId: string;
  accessToken: string;
  refreshToken: string;
  accountInfo?: any;
  userInfo?: any;
  status: string;
  lastConnectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const zoomIntegrationSchema = new Schema<IZoomIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  accountId: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  accountInfo: { type: Schema.Types.Mixed, required: false },
  userInfo: { type: Schema.Types.Mixed, required: false },
  status: { type: String, required: true },
  lastConnectionAt: { type: Date, required: false }
}, { timestamps: true });

const ZoomIntegration: Model<IZoomIntegration> = mongoose.models.ZoomIntegration || mongoose.model<IZoomIntegration>('ZoomIntegration', zoomIntegrationSchema);

export default ZoomIntegration;
