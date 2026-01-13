import express from 'express';
import { protect } from '../middleware/auth';
import {
  getIntegrations,
  getIntegration,
  connectIntegration,
  disconnectIntegration,
  configureIntegration
} from '../controllers/IntegrationsController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getIntegrations);

router.route('/:id')
  .get(getIntegration);

router.route('/:id/connect')
  .post(connectIntegration);

router.route('/:id/disconnect')
  .post(disconnectIntegration);

router.route('/:id/configure')
  .post(configureIntegration);

export default router;