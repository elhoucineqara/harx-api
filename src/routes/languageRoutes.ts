import express from 'express';
const router = express.Router();
import languageController from '../controllers/LanguageController';

/**
 * @route GET /api/languages
 * @desc Récupère toutes les langues avec support de recherche et pagination
 * @query {string} search - Terme de recherche optionnel
 * @query {number} page - Numéro de page pour la pagination
 * @query {number} limit - Nombre d'éléments par page
 * @access Public
 */
router.get('/', languageController.getAllLanguages);

/**
 * @route GET /api/languages/popular
 * @desc Récupère les langues populaires
 * @access Public
 */
router.get('/popular', languageController.getPopularLanguages);

/**
 * @route GET /api/languages/search
 * @desc Recherche des langues
 * @query {string} q - Terme de recherche
 * @access Public
 */
router.get('/search', languageController.searchLanguages);

/**
 * @route GET /api/languages/stats
 * @desc Obtient des statistiques sur les langues
 * @access Public
 */
router.get('/stats', languageController.getLanguageStats);

/**
 * @route GET /api/languages/:code
 * @desc Récupère une langue par son code
 * @param {string} code - Code de la langue (ex: 'en', 'fr', 'es')
 * @access Public
 */
router.get('/:code', languageController.getLanguageByCode);

export default router; 