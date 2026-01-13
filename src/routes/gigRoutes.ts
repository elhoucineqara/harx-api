import express from 'express';
import GigController from '../controllers/GigController';

const router = express.Router();

// Gig management routes
router.get('/', GigController.getAll);
router.get('/:id', GigController.getById);
router.post('/', GigController.create);
router.put('/:id', GigController.update);
router.delete('/:id', GigController.delete);

// Availability management - Not currently implemented in Controller
// router.post('/:id/availability', GigController.saveGigAvailability);
// router.get('/:id/availability', GigController.getGigAvailability);
// router.put('/:id/availability', GigController.updateGigAvailability);

export default router;