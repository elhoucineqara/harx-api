import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrainingMethodology extends Omit<Document, '_id'> {
  _id: string;
  name: string;
  description: string;
  industry: string;
  region?: string;
  components?: Array<{
    _id: string;
    category: string;
    title: string;
    description: string;
    modules?: string[];
    weight?: number;
    prerequisites?: string[];
    estimatedDuration?: number;
    competencyLevel?: string;
    mandatoryForCertification?: boolean;
  }>;
  learningFramework?: {
    approach?: string;
    learningObjectives?: Array<{
      _id: string;
      level: string;
      description: string;
      measurableOutcome?: string;
      assessmentMethod?: string[];
    }>;
    deliveryMethods?: Array<{
      type: string;
      percentage: number;
      rationale: string;
    }>;
    reinforcementStrategy?: {
      spacedRepetition?: boolean;
      practiceIntervals?: number[];
      refresherContent?: string[];
      performanceSupport?: string[];
    };
  };
  assessmentStrategy?: {
    formative?: Array<{
      type: string;
      frequency: string;
      feedback: string;
    }>;
    summative?: Array<{
      type: string;
      passingCriteria?: string;
      retakePolicy?: string;
      certificationWeight?: number;
    }>;
    competencyMapping?: Array<{
      competency: string;
      behavioralIndicators?: string[];
      assessmentMethods?: string[];
      proficiencyLevels?: Array<{
        level: number;
        name: string;
        description: string;
        criteria?: string[];
      }>;
    }>;
    continuousImprovement?: boolean;
  };
  certificationPath?: {
    levels?: Array<{
      _id: string;
      name: string;
      description: string;
      requiredComponents?: string[];
      minimumScore?: number;
      practicalRequirements?: string[];
      timeframe?: string;
      badge?: string;
    }>;
    maintenanceRequirements?: Array<{
      type: string;
      frequency: string;
      hours: number;
      description: string;
    }>;
    advancementCriteria?: Array<{
      fromLevel: string;
      toLevel: string;
      requirements?: string[];
      timeInRole?: number;
      performanceMetrics?: string[];
    }>;
  };
  regionalCompliance?: Array<{
    region: string;
    regulations?: Array<{
      name: string;
      description: string;
      applicableCountries?: string[];
      complianceRequirements?: string[];
      penalties?: string[];
      trainingModules?: string[];
      updateFrequency?: string;
    }>;
    dataProtection?: Array<{
      regulation: string;
      scope: string;
      keyRequirements?: string[];
      consentManagement?: string[];
      dataSubjectRights?: string[];
      breachNotification?: string[];
    }>;
    consumerRights?: Array<{
      right: string;
      description: string;
      implementation?: string[];
      documentation?: string[];
      timeframes?: string[];
    }>;
  }>;
  isActive?: boolean;
  updatedAt?: Date;
  _class?: string;
}

const trainingMethodologySchema = new Schema<ITrainingMethodology>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  industry: { type: String, required: true },
  region: String,
  components: [{
    _id: String,
    category: String,
    title: String,
    description: String,
    modules: [String],
    weight: Number,
    prerequisites: [String],
    estimatedDuration: Number,
    competencyLevel: String,
    mandatoryForCertification: Boolean
  }],
  learningFramework: {
    approach: String,
    learningObjectives: [{
      _id: String,
      level: String,
      description: String,
      measurableOutcome: String,
      assessmentMethod: [String]
    }],
    deliveryMethods: [{
      type: String,
      percentage: Number,
      rationale: String
    }],
    reinforcementStrategy: {
      spacedRepetition: Boolean,
      practiceIntervals: [Number],
      refresherContent: [String],
      performanceSupport: [String]
    }
  },
  assessmentStrategy: {
    formative: [{
      type: String,
      frequency: String,
      feedback: String
    }],
    summative: [{
      type: String,
      passingCriteria: String,
      retakePolicy: String,
      certificationWeight: Number
    }],
    competencyMapping: [{
      competency: String,
      behavioralIndicators: [String],
      assessmentMethods: [String],
      proficiencyLevels: [{
        level: Number,
        name: String,
        description: String,
        criteria: [String]
      }]
    }],
    continuousImprovement: Boolean
  },
  certificationPath: {
    levels: [{
      _id: String,
      name: String,
      description: String,
      requiredComponents: [String],
      minimumScore: Number,
      practicalRequirements: [String],
      timeframe: String,
      badge: String
    }],
    maintenanceRequirements: [{
      type: String,
      frequency: String,
      hours: Number,
      description: String
    }],
    advancementCriteria: [{
      fromLevel: String,
      toLevel: String,
      requirements: [String],
      timeInRole: Number,
      performanceMetrics: [String]
    }]
  },
  regionalCompliance: [{
    region: String,
    regulations: [{
      name: String,
      description: String,
      applicableCountries: [String],
      complianceRequirements: [String],
      penalties: [String],
      trainingModules: [String],
      updateFrequency: String
    }],
    dataProtection: [{
      regulation: String,
      scope: String,
      keyRequirements: [String],
      consentManagement: [String],
      dataSubjectRights: [String],
      breachNotification: [String]
    }],
    consumerRights: [{
      right: String,
      description: String,
      implementation: [String],
      documentation: [String],
      timeframes: [String]
    }]
  }],
  isActive: { type: Boolean, default: true },
  updatedAt: Date,
  _class: String
}, { timestamps: true, _id: false });

const TrainingMethodology: Model<ITrainingMethodology> = mongoose.models.TrainingMethodology || mongoose.model<ITrainingMethodology>('TrainingMethodology', trainingMethodologySchema);

export default TrainingMethodology;

