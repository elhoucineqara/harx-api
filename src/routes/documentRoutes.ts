import express from 'express';
import documentController from '../controllers/DocumentController';

const router = express.Router();

// Get all documents
router.get('/', (req, res) => documentController.getAll(req, res));

// Get document by ID
router.get('/:id', (req, res) => documentController.getById(req, res));

// Create (upload) a document
router.post('/', (req, res) => documentController.create(req, res));
// Note: File upload middleware usually goes here before the controller

// Update a document
router.put('/:id', (req, res) => documentController.update(req, res));

// Delete a document
router.delete('/:id', (req, res) => documentController.delete(req, res));

// Routes not implemented in controller yet:
// router.post('/:id/analyze', documentController.analyzeDocument);

export default router;