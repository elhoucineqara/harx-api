import Call from '../models/Call';
import Agent from '../models/Agent';
import Lead from '../models/Lead';

export class DashboardRepository {
  async getStats() {
    return Promise.all([
      Call.find(),
      Agent.find(),
      Lead.find()
    ]);
  }

  async getLiveCalls() {
    return Call.find({ status: 'active' })
      .populate('agent', 'name')
      .populate('lead', 'name company');
  }

  async getTopGigs() {
    return Agent.find()
      .sort({ 'performance.success_rate': -1 })
      .limit(5);
  }

  async getTopReps() {
    return Agent.find()
      .sort({ rating: -1 })
      .limit(5);
  }
}
