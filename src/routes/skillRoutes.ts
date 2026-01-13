import express from 'express';
const router = express.Router();
import skillController from '../controllers/SkillController';
import { authenticate } from '../middleware/auth';

// Public routes for getting available skills
// IMPORTANT: Specific routes must come before parameterized routes
router.get('/stats', skillController.getSkillsStats);
router.get('/:type/grouped', skillController.getAllSkillsGroupedByCategory);
router.get('/:type/category/:category', skillController.getSkillsByCategory);
router.get('/:type/search', skillController.searchSkills);
router.get('/:type/:skillId', skillController.getSkillById);
router.get('/:type', skillController.getAllSkillsByType); // This must be last

// Protected routes for agent skills management
router.use(authenticate);

// Agent-specific skill routes
router.get('/agent/:agentId', skillController.getAgentSkills);
router.post('/agent/:agentId/add', skillController.addSkillsToAgent);
router.put('/agent/:agentId', skillController.updateAgentSkills);
router.delete('/agent/:agentId/remove', skillController.removeSkillsFromAgent);

export default router; 