import express from 'express';
import { requirementController } from '../controllers/RequirementController.js';

const router = express.Router();

// Obtenir les requirements pour un pays
router.get(
  '/countries/:countryCode/requirements',
  requirementController.getCountryRequirements
);

export const requirementRoutes = router;