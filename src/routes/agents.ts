import express from 'express';
import { protect } from '../middleware/auth';
import {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  updateAvailability,
  updateSkills
} from '../controllers/AgentsController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAgents)
  .post(createAgent);

router.route('/:id')
  .get(getAgent)
  .put(updateAgent)
  .delete(deleteAgent);

router.route('/:id/availability')
  .put(updateAvailability);

router.route('/:id/skills')
  .put(updateSkills);

export default router;