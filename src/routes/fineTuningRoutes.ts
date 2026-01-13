import express from 'express';
import FineTuningController from '../controllers/FineTuningController';

const router = express.Router();

// Create a new fine-tuning job
router.post('/jobs', FineTuningController.createFineTuningJob);

// Get all fine-tuning jobs
router.get('/jobs', FineTuningController.getAllFineTuningJobs);

// Get a single fine-tuning job by ID
router.get('/jobs/:id', FineTuningController.getFineTuningJobById);

// Update fine-tuning job status
router.patch('/jobs/:id/status', FineTuningController.updateFineTuningJobStatus);

// Cancel a fine-tuning job
router.post('/jobs/:id/cancel', FineTuningController.cancelFineTuningJob);

// Test fine-tuned model
router.post('/test', FineTuningController.testFineTunedModel);

export default router;