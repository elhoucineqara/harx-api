import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IGigAgent extends Document {
  agentId: Types.ObjectId;
  gigId: Types.ObjectId;
  status: 'pending' | 'enrolled' | 'requested' | 'rejected' | 'cancelled' | 'expired';
  matchScore?: number | null;
  matchDetails?: {
    languageMatch?: {
      details?: {
        matchingLanguages?: any[];
        missingLanguages?: any[];
        insufficientLanguages?: any[];
      };
    };
    skillsMatch?: {
      details?: {
        matchingSkills?: any[];
        missingSkills?: any[];
        insufficientSkills?: any[];
      };
    };
    industryMatch?: {
      details?: {
        matchingIndustries?: any[];
        missingIndustries?: any[];
      };
    };
    activityMatch?: {
      details?: {
        matchingActivities?: any[];
        missingActivities?: any[];
      };
    };
    availabilityMatch?: {
      details?: {
        missingDays?: any[];
        matchingDays?: any[];
        insufficientHours?: any[];
      };
    };
  };
  matchStatus?: string | null;
  emailSent?: boolean;
  agentResponse?: string;
  agentResponseAt?: Date;
  enrollmentStatus?: string;
  priority?: string;
  matchingWeights?: {
    experience?: number;
    skills?: number;
    industry?: number;
    languages?: number;
    availability?: number;
    timezone?: number;
    activities?: number;
    region?: number;
  };
  invitationToken?: string;
  invitationSentAt?: Date;
  invitationExpiresAt?: Date;
  enrollmentNotes?: string;
  enrollmentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  calculateMatchStatus(): void;
  markEmailSent(): Promise<this>;
  generateInvitationToken(): string;
  acceptEnrollment(notes?: string): Promise<this>;
  rejectEnrollment(notes?: string): Promise<this>;
  isInvitationExpired(): boolean;
  expireInvitation(): Promise<this>;
  canEnroll(): boolean;
  requestEnrollment(notes?: string): Promise<this>;
  canRequestEnrollment(): boolean;
}

const GigAgentSchema = new Schema<IGigAgent>({
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  },
  gigId: {
    type: Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'enrolled', 'requested', 'rejected', 'cancelled', 'expired'],
    default: 'pending',
  },
  matchScore: Number,
  matchDetails: {
    languageMatch: {
      details: {
        matchingLanguages: [Schema.Types.Mixed],
        missingLanguages: [Schema.Types.Mixed],
        insufficientLanguages: [Schema.Types.Mixed]
      }
    },
    skillsMatch: {
      details: {
        matchingSkills: [Schema.Types.Mixed],
        missingSkills: [Schema.Types.Mixed],
        insufficientSkills: [Schema.Types.Mixed]
      }
    },
    industryMatch: {
      details: {
        matchingIndustries: [Schema.Types.Mixed],
        missingIndustries: [Schema.Types.Mixed]
      }
    },
    activityMatch: {
      details: {
        matchingActivities: [Schema.Types.Mixed],
        missingActivities: [Schema.Types.Mixed]
      }
    },
    availabilityMatch: {
      details: {
        missingDays: [Schema.Types.Mixed],
        matchingDays: [Schema.Types.Mixed],
        insufficientHours: [Schema.Types.Mixed]
      }
    }
  },
  matchStatus: String,
  emailSent: { type: Boolean, default: false },
  agentResponse: { type: String, default: 'pending' },
  agentResponseAt: Date,
  enrollmentStatus: String,
  priority: String,
  matchingWeights: {
    experience: Number,
    skills: Number,
    industry: Number,
    languages: Number,
    availability: Number,
    timezone: Number,
    activities: Number,
    region: Number
  },
  invitationToken: String,
  invitationSentAt: Date,
  invitationExpiresAt: Date,
  enrollmentNotes: String,
  enrollmentDate: Date,
  notes: String
}, { timestamps: true });

// Prevent duplicate entries for same gig-agent pair
GigAgentSchema.index({ gigId: 1, agentId: 1 }, { unique: true });

// Method to calculate match status based on matchScore and matchDetails
GigAgentSchema.methods.calculateMatchStatus = function() {
  if (!this.matchScore && this.matchScore !== 0) {
    this.matchStatus = 'no_match';
    return;
  }

  // Determine match status based on score
  if (this.matchScore >= 0.9) {
    this.matchStatus = 'perfect_match';
  } else if (this.matchScore >= 0.5) {
    this.matchStatus = 'partial_match';
  } else if (this.matchScore > 0) {
    this.matchStatus = 'low_match';
  } else {
    this.matchStatus = 'no_match';
  }

  // Override with more specific status from matchDetails if available
  if (this.matchDetails) {
    const details = this.matchDetails;
    
    // Check if all critical matches are perfect
    const hasLanguageMatch = details.languageMatch?.details?.matchStatus === 'perfect_match';
    const hasSkillsMatch = details.skillsMatch?.details?.matchStatus === 'perfect_match';
    const hasIndustryMatch = details.industryMatch?.score === 1;
    
    if (hasLanguageMatch && hasSkillsMatch && hasIndustryMatch && this.matchScore >= 0.8) {
      this.matchStatus = 'perfect_match';
    } else if (details.languageMatch?.details?.matchStatus === 'no_match' && 
               details.skillsMatch?.details?.matchStatus === 'no_match') {
      this.matchStatus = 'no_match';
    }
  }
};

// Method to mark email as sent
GigAgentSchema.methods.markEmailSent = async function() {
  this.emailSent = true;
  this.invitationSentAt = new Date();
  return this.save();
};

// Method to generate invitation token
GigAgentSchema.methods.generateInvitationToken = function() {
  const crypto = require('crypto');
  this.invitationToken = crypto.randomBytes(32).toString('hex');
  return this.invitationToken;
};

// Method to accept enrollment
GigAgentSchema.methods.acceptEnrollment = async function(notes = '') {
  this.enrollmentStatus = 'enrolled';
  this.status = 'enrolled';
  this.agentResponse = 'accepted';
  this.enrollmentDate = new Date();
  this.enrollmentNotes = notes;
  return this.save();
};

// Method to reject enrollment
GigAgentSchema.methods.rejectEnrollment = function(notes = '') {
  this.enrollmentStatus = 'rejected';
  this.status = 'rejected';
  this.agentResponse = 'rejected';
  this.enrollmentNotes = notes;
  return this.save();
};

// Method to check if invitation is expired
GigAgentSchema.methods.isInvitationExpired = function() {
  if (!this.invitationExpiresAt) {
    return false;
  }
  return new Date() > this.invitationExpiresAt;
};

// Method to expire invitation
GigAgentSchema.methods.expireInvitation = function() {
  this.enrollmentStatus = 'expired';
  this.status = 'expired';
  return this.save();
};

// Method to check if can enroll
GigAgentSchema.methods.canEnroll = function() {
  return this.enrollmentStatus === 'invited' && !this.isInvitationExpired();
};

// Method to request enrollment
GigAgentSchema.methods.requestEnrollment = function(notes = '') {
  this.enrollmentStatus = 'requested';
  this.status = 'pending';
  this.enrollmentNotes = notes;
  this.enrollmentDate = new Date();
  return this.save();
};

// Method to check if can request enrollment
GigAgentSchema.methods.canRequestEnrollment = function() {
  return !this.enrollmentStatus || 
         this.enrollmentStatus === 'rejected' || 
         this.enrollmentStatus === 'expired' ||
         this.enrollmentStatus === 'cancelled';
};

const GigAgent: Model<IGigAgent> = mongoose.models.GigAgent || mongoose.model<IGigAgent>('GigAgent', GigAgentSchema);

export default GigAgent;


