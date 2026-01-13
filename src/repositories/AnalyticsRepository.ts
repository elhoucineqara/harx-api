import Call from '../models/Call';
import Agent from '../models/Agent';
import Lead from '../models/Lead';

export class AnalyticsRepository {
  async getOverviewData() {
    const [calls, agents, leads] = await Promise.all([
      Call.find(),
      Agent.find(),
      Lead.find()
    ]);

    return { calls, agents, leads };
  }

  async getCallMetrics() {
    return Call.find()
      .populate('agent', 'name')
      .populate('lead', 'name company');
  }

  async getAgentMetrics() {
    return Agent.find().populate('user', 'name email');
  }

  async getQualityMetrics() {
    return Call.find().select('quality_score');
  }
}
