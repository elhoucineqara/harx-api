import express from 'express';
const router = express.Router();
const contactCenterController = require('../../controllers/contactCenterController');

/**
 * @route POST /api/contact-center/generate-scenario
 * @desc Generate a scenario for contact center assessment
 * @body {string} skillName - The name of the skill to test
 * @body {string} category - The category of the skill
 * @access Public
 */
router.post('/generate-scenario', contactCenterController.generateScenario);

/**
 * @route POST /api/contact-center/analyze-response
 * @desc Analyze a contact center response
 * @body {string} response - The agent's response
 * @body {object} scenario - The scenario data
 * @body {string} skillName - The name of the skill being tested
 * @access Public
 */
router.post('/analyze-response', contactCenterController.analyzeResponse);

export default router;
