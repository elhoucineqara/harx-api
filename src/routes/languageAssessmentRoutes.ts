import express from 'express';
const router = express.Router();
const languageAssessmentController = require('../../controllers/languageAssessmentController');

/**
 * @route POST /api/language-assessment/analyze
 * @desc Analyze language proficiency based on passage reading
 * @body {string} passage - The text passage that was read
 * @body {string} language - The language being assessed
 * @access Public
 */
router.post('/analyze', languageAssessmentController.analyzeLanguageAssessment);

/**
 * @route POST /api/language-assessment/get-language-code
 * @desc Get standardized language code from language name
 * @body {string} language - The language name to convert
 * @access Public
 */
router.post('/get-language-code', languageAssessmentController.getLanguageCode);

/**
 * @route POST /api/language-assessment/generate-passage
 * @desc Generate a random passage in the target language
 * @body {string} language - The language name
 * @body {string} targetLanguageCode - The ISO 639-1 language code
 * @access Public
 */
router.post('/generate-passage', languageAssessmentController.generatePassage);

/**
 * @route POST /api/language-assessment/get-passage
 * @desc Get a passage for a specific language (combines language code lookup and passage generation)
 * @body {string} language - The language name or code
 * @access Public
 */
router.post('/get-passage', languageAssessmentController.getPassage);

/**
 * @route POST /api/language-assessment/get-new-passage
 * @desc Get a new passage for a language (alias for get-passage)
 * @body {string} language - The language name or code
 * @access Public
 */
router.post('/get-new-passage', languageAssessmentController.getPassage);

export default router;
