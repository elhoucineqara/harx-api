import express from 'express';
import { protect } from '../middleware/auth';
import {
  getOverview,
  getCallMetrics,
  getAgentMetrics,
  getQualityMetrics
} from '../controllers/AnalyticsController';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/calls', getCallMetrics);
router.get('/agents', getAgentMetrics);
router.get('/quality', getQualityMetrics);

export default router;