import { DashboardRepository } from '../repositories/DashboardRepository';

class DashboardService {
  private readonly repository: DashboardRepository;

  constructor() {
    this.repository = new DashboardRepository();
  }

  async getStats() {
    const [calls, agents, leads] = await this.repository.getStats();

    return {
      activeGigs: agents.filter(agent => agent.status === 'completed').length,
      globalReps: agents.length,
      successRate: (calls.filter(call => call.status === 'completed').length / calls.length) * 100 || 0,
      revenue: leads.reduce((acc, lead) => acc + (lead.value || 0), 0)
    };
  }

  async getLiveCalls() {
    return this.repository.getLiveCalls();
  }

  async getTopGigs() {
    const agents = await this.repository.getTopGigs();
    return agents.map(agent => ({
      name: agent.name || (agent as any).personalInfo?.name || 'Unknown',
      success: agent.performance?.success_rate || 0,
      calls: agent.performance?.calls_handled || 0,
      revenue: agent.performance?.customer_satisfaction || 0
    }));
  }

  async getTopReps() {
    const agents = await this.repository.getTopReps();
    return agents.map(agent => ({
      name: agent.name || (agent as any).personalInfo?.name || 'Unknown',
      rating: agent.rating || 0,
      calls: agent.performance?.calls_handled || 0,
      revenue: agent.performance?.customer_satisfaction || 0
    }));
  }
}

export { DashboardService };