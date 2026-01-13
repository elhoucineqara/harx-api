import express from 'express';
import agentController from '../controllers/AgentController';

const router = express.Router();

// Get all agents
router.get('/', (req, res) => agentController.getAll(req, res));

// Get agent by ID
router.get('/:id', (req, res) => agentController.getById(req, res));

// Create a new agent
router.post('/', (req, res) => agentController.create(req, res));

// Update an agent
router.put('/:id', (req, res) => agentController.update(req, res));

// Delete an agent
router.delete('/:id', (req, res) => agentController.delete(req, res));

export default router;