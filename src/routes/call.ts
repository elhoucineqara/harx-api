import express from 'express';
import callController from '../controllers/CallController';

const router = express.Router();

// Initiate a call (create)
router.post('/initiate', (req, res) => callController.create(req, res));

// Other call actions not currently implemented in standard controller:
// router.post('/answer', callController.handleAnswer);
// router.post('/:id/hangup', callController.hangupCall);
// router.post('/:id/record/start', callController.startRecording);
// router.post('/:id/record/stop', callController.stopRecording);

// Standard CRUD
router.get('/', (req, res) => callController.getAll(req, res));
router.get('/:id', (req, res) => callController.getById(req, res));
router.put('/:id', (req, res) => callController.update(req, res));
router.delete('/:id', (req, res) => callController.delete(req, res));

export default router;