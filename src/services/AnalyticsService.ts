import { AnalyticsRepository } from '../repositories/AnalyticsRepository';

class AnalyticsService {
  private repository: AnalyticsRepository;
  
  constructor() {
    this.repository = new AnalyticsRepository();
  }

  async getOverview() {
    const { calls, agents, leads } = await this.repository.getOverviewData();

    return {
      calls: {
        total: calls.length,
        answered: calls.filter((call: any) => call.status === 'completed').length,
        missed: calls.filter((call: any) => call.status === 'missed').length,
        avg_duration: calls.reduce((acc: number, call: any) => acc + call.duration, 0) / calls.length || 0
      },
      agents: {
        total: agents.length,
        active: agents.filter((agent: any) => agent.status === 'active').length,
        performance: agents.map((agent: any) => ({
          agent_id: agent._id,
          calls_handled: agent.performance?.calls_handled,
          avg_duration: agent.performance?.avg_duration,
          success_rate: agent.performance?.success_rate
        }))
      },
      leads: {
        total: leads.length,
        new: leads.filter((lead: any) => lead.status === 'new').length,
        converted: leads.filter((lead: any) => lead.status === 'won').length,
        conversion_rate: (leads.filter((lead: any) => lead.status === 'won').length / leads.length) * 100 || 0
      }
    };
  }

  async getCallMetrics() {
    return this.repository.getCallMetrics();
  }

  async getAgentMetrics() {
    return this.repository.getAgentMetrics();
  }

  async getQualityMetrics() {
    const calls = await this.repository.getQualityMetrics() as any[];
    
    return {
      avg_score: calls.reduce((acc, call) => acc + (call.quality_score || 0), 0) / calls.length || 0,
      total_evaluated: calls.filter(call => call.quality_score != null).length,
      score_distribution: {
        excellent: calls.filter(call => call.quality_score >= 90).length,
        good: calls.filter(call => call.quality_score >= 70 && call.quality_score < 90).length,
        average: calls.filter(call => call.quality_score >= 50 && call.quality_score < 70).length,
        poor: calls.filter(call => call.quality_score < 50).length
      }
    };
  }
}

export { AnalyticsService };
