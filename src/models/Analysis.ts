import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAnalysis extends Document {
  companyId: string;
  status: string;
  type: string;
  documentCount: number;
  documentIds: Types.ObjectId[];
  startTime: Date;
  endTime?: Date;
  topicAnalysis?: {
    coveredTopics?: any[];
    missingTopics?: any[];
    topicRelationships?: any[];
  };
  contentQuality?: {
    strengths?: any[];
    weaknesses?: any[];
    consistencyIssues?: any[];
  };
  progress?: number;
  recommendations?: any[];
  results?: {
    topicAnalysis?: {
      summary?: string;
      mainTopics?: Array<{
        topic: string;
        description: string;
        relatedDocuments?: Array<{
          name: string;
          relevance: string;
        }>;
      }>;
    };
    knowledgeGaps?: {
      summary?: string;
      gaps?: Array<{
        gap: string;
        impact: string;
        affectedAreas?: string[];
        relatedDocuments?: Array<{
          name: string;
          context: string;
        }>;
      }>;
    };
    recommendations?: {
      summary?: string;
      priorities?: Array<{
        recommendation: string;
        priority: string;
        rationale: string;
        implementation: string;
        relatedGaps?: string[];
        affectedDocuments?: Array<{
          name: string;
        }>;
      }>;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const analysisSchema = new Schema<IAnalysis>({
  companyId: { type: String, required: true },
  status: { type: String, required: true },
  type: { type: String, required: true },
  documentCount: { type: Number, required: true },
  documentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
  startTime: { type: Date, required: true },
  endTime: Date,
  topicAnalysis: {
    coveredTopics: [Schema.Types.Mixed],
    missingTopics: [Schema.Types.Mixed],
    topicRelationships: [Schema.Types.Mixed]
  },
  contentQuality: {
    strengths: [Schema.Types.Mixed],
    weaknesses: [Schema.Types.Mixed],
    consistencyIssues: [Schema.Types.Mixed]
  },
  progress: { type: Number, default: 0 },
  recommendations: [Schema.Types.Mixed],
  results: {
    topicAnalysis: {
      summary: String,
      mainTopics: [{
        topic: String,
        description: String,
        relatedDocuments: [{
          name: String,
          relevance: String
        }]
      }]
    },
    knowledgeGaps: {
      summary: String,
      gaps: [{
        gap: String,
        impact: String,
        affectedAreas: [String],
        relatedDocuments: [{
          name: String,
          context: String
        }]
      }]
    },
    recommendations: {
      summary: String,
      priorities: [{
        recommendation: String,
        priority: String,
        rationale: String,
        implementation: String,
        relatedGaps: [String],
        affectedDocuments: [{
          name: String
        }]
      }]
    }
  }
}, { timestamps: true });

const Analysis: Model<IAnalysis> = mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', analysisSchema);

export default Analysis;

