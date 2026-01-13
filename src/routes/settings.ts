import express from 'express';
import { protect } from '../middleware/auth';
import {
  getSettings,
  updateSettings,
  updateLogo
} from '../controllers/SettingsController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSettings)
  .put(updateSettings);

router.route('/logo')
  .put(updateLogo);

export default router;