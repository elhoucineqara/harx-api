import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './User';
import { ICompany } from './Company';

export interface IZohoConfig extends Document {
  userId: string | Types.ObjectId | IUser;
  companyId?: Types.ObjectId | ICompany;
  clientId?: string;
  clientSecret?: string;
  refreshToken: string;
  accessToken?: string;
  expiresIn?: number;
  lastUpdated?: Date;
  updated_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const zohoConfigSchema = new Schema<IZohoConfig>({
  userId: {
    type: Schema.Types.Mixed,
    required: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: false
  },
  clientId: {
    type: String,
    required: false
  },
  clientSecret: {
    type: String,
    required: false
  },
  refreshToken: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: false
  },
  expiresIn: {
    type: Number,
    required: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updated_at: Date
}, { timestamps: true });

const ZohoConfig: Model<IZohoConfig> = mongoose.models.ZohoConfig || mongoose.model<IZohoConfig>('ZohoConfig', zohoConfigSchema);

export default ZohoConfig;

