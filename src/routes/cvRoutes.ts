import express from 'express';
import cvController from '../controllers/CvController';

const router = express.Router();

/**
 * @route POST /api/cv/extract-basic-info
 * @desc Extract basic information from a CV using OpenAI
 * @body {string} contentToProcess - The CV content to analyze
 * @access Public
 */
router.post('/extract-basic-info', cvController.extractBasicInfo);

/**
 * @route POST /api/cv/analyze-experience
 * @desc Analyze work experience from CV
 * @body {string} contentToProcess - The CV content to analyze
 * @access Public
 */
router.post('/analyze-experience', cvController.analyzeExperience);

/**
 * @route POST /api/cv/analyze-skills
 * @desc Extract skills and languages from CV
 * @body {string} contentToProcess - The CV content to analyze
 * @access Public
 */
router.post('/analyze-skills', cvController.analyzeSkills);

/**
 * @route POST /api/cv/analyze-achievements
 * @desc Extract achievements and projects from CV
 * @body {string} contentToProcess - The CV content to analyze
 * @access Public
 */
router.post('/analyze-achievements', cvController.analyzeAchievements);

/**
 * @route POST /api/cv/analyze-availability
 * @desc Analyze availability information from CV
 * @body {string} contentToProcess - The CV content to analyze
 * @access Public
 */
router.post('/analyze-availability', cvController.analyzeAvailability);

/**
 * @route POST /api/cv/generate-summary
 * @desc Generate a professional summary using REPS framework
 * @body {object} profileData - The complete profile data to summarize
 * @access Public
 */
router.post('/generate-summary', cvController.generateSummary);

export default router;
