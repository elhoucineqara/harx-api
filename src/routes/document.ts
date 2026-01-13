import express from 'express';
import documentController from '../controllers/DocumentController';

const router = express.Router();

// Get all documents
router.get('/', (req, res) => documentController.getAll(req, res));

// Get document by ID
router.get('/:id', (req, res) => documentController.getById(req, res));

// Create document
router.post('/', (req, res) => documentController.create(req, res));
// router.post('/upload', documentController.uploadMiddleware, documentController.uploadDocument);

// Delete document
router.delete('/:id', (req, res) => documentController.delete(req, res));

// Download document (not implemented)
// router.get('/:id/download', documentController.downloadDocument);

export default router;
