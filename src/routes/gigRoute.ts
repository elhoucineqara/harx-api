import express from "express";
import GigController from '../controllers/GigController';

const router = express.Router();

// Routes for Gig management
router.post('/add', GigController.create);
router.get('/all', GigController.getAll);
// router.get('/active', GigController.getActiveGigs); // Not implemented
router.get('/:id', GigController.getById);
// router.get('/:id/details', GigController.getGigDetailsById); // Not implemented
// router.get('/:id/destination-zone', GigController.getGigDestinationZoneById); // Not implemented
router.put('/:id', GigController.update);
router.delete('/:id', GigController.delete);

// Routes for Gig analysis & processing
// router.post('/:id/analyze', GigController.analyzeGig); // Not implemented
// router.post('/:id/matching', GigController.runMatching); // Not implemented

// Additional company-related routes
router.get('/company/:companyId/last', GigController.getGigsByCompanyId); // Use general list for now

// Image generation
// router.post('/generate-image', GigController.uploadDalleImageToCloudinary); // Not implemented

export default router;
