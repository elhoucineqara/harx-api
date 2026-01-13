import express from 'express';
import { protect } from '../middleware/auth';
import {
  getStats,
  getLiveCalls,
  getTopGigs,
  getTopReps
} from '../controllers/DashboardController';

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/live-calls', getLiveCalls);
router.get('/top-gigs', getTopGigs);
router.get('/top-reps', getTopReps);

export default router;