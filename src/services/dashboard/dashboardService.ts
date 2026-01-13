import Call from '../../models/Call';
import Agent from '../../models/Agent';
import Lead from '../../models/Lead';
import dbConnect from '../../lib/dbConnect';

export class DashboardService {
  async getStats() {
    await dbConnect();
    
    // In a real scenario, we might want to optimize this by using aggregate queries 
    // or limiting the fields fetched, rather than fetching all documents.
    // For now, mirroring the original logic.
    
    // Note: Models like Call and Lead need to be migrated or defined if they don't exist in harx/models
    // I need to check if Call and Lead models exist in harx/models. 
    // Agent exists.
    
    const [calls, agents, leads] = await Promise.all([
      Call.find({}).lean(), // .lean() for performance
      Agent.find({}).lean(),
      Lead.find({}).lean()
    ]);

    const activeGigs = agents.filter((agent: any) => agent.status === 'active').length;
    const globalReps = agents.length;
    
    // Calculate success rate
    const completedCalls = calls.filter((call: any) => call.status === 'completed').length;
    const successRate = calls.length > 0 ? (completedCalls / calls.length) * 100 : 0;
    
    // Calculate revenue
    const revenue = leads.reduce((acc: number, lead: any) => acc + (lead.value || 0), 0);

    return {
      activeGigs,
      globalReps,
      successRate: Math.round(successRate * 100) / 100, // Round to 2 decimals
      revenue
    };
  }

  async getLiveCalls() {
    await dbConnect();
    return Call.find({ status: 'active' })
      .populate('agent', 'name')
      .populate('lead', 'name company')
      .lean();
  }

  async getTopGigs() {
    await dbConnect();
    // Assuming 'Agent' model is used for Gigs here based on original code, 
    // but in v25_gigsmanualcreation, there is a Gig model.
    // The original code uses Agent.find() for top gigs? That seems like top agents/reps.
    // However, DashboardRepository.js uses Agent.find().
    // I'll stick to Agent for now but it might be confusing naming in original.
    
    const agents = await Agent.find({})
      .sort({ 'performance.success_rate': -1 })
      .limit(5)
      .lean();

    return agents.map((agent: any) => ({
      name: agent.personalInfo?.name || agent.name || 'Unknown', // Helper for name
      success: agent.performance?.success_rate || 0,
      calls: agent.performance?.calls_handled || 0,
      revenue: agent.performance?.customer_satisfaction || 0 // Original code maps revenue to satisfaction??
    }));
  }

  async getTopReps() {
    await dbConnect();
    const agents = await Agent.find({})
      .sort({ rating: -1 }) // Assuming rating field exists
      .limit(5)
      .lean();

    return agents.map((agent: any) => ({
      name: agent.personalInfo?.name || agent.name || 'Unknown',
      rating: agent.rating || 0,
      calls: agent.performance?.calls_handled || 0,
      revenue: agent.performance?.customer_satisfaction || 0
    }));
  }
}

export const dashboardService = new DashboardService();


