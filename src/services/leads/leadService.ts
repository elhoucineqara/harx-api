import Lead, { ILead } from '../../models/Lead';
import dbConnect from '../../lib/dbConnect';

export class LeadService {
  async getAllLeads(query: any = {}, options: any = {}) {
    await dbConnect();
    const { page = 1, limit = 50, sort = { updatedAt: -1 }, populate } = options;
    const skip = (page - 1) * limit;

    const leads = await Lead.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate || 'assignedTo')
      .lean();

    const total = await Lead.countDocuments(query);

    return {
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getLeadById(id: string) {
    await dbConnect();
    return Lead.findById(id).populate('assignedTo').lean();
  }

  async createLead(data: Partial<ILead>) {
    await dbConnect();
    return Lead.create(data);
  }

  async updateLead(id: string, data: Partial<ILead>) {
    await dbConnect();
    return Lead.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  }

  async deleteLead(id: string) {
    await dbConnect();
    return Lead.findByIdAndDelete(id).lean();
  }

  async analyzeLead(id: string) {
    await dbConnect();
    const lead = await Lead.findById(id);
    if (!lead) throw new Error('Lead not found');

    // Simulated AI analysis (to be replaced with actual AI logic later)
    // Note: 'metadata' field is not in ILead interface yet, assuming it might be added or using existing fields
    // For now, returning simulated data without saving if field doesn't exist
    const analysis = {
      score: Math.floor(Math.random() * 30) + 70,
      sentiment: Math.random() > 0.5 ? 'Positive' : 'Neutral'
    };

    // If schema allows metadata, update it. For now, returning result.
    return analysis;
  }

  async generateScript(id: string, type: string) {
    await dbConnect();
    const lead = await Lead.findById(id).lean();
    if (!lead) throw new Error('Lead not found');

    // Simulated script generation
    return {
      content: `Hello ${lead.Deal_Name || 'Contact'}, this is a ${type} script...`,
      type
    };
  }
}

export const leadService = new LeadService();


