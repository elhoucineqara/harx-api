import express from 'express';
const router = express.Router();
const industryController = require('../../controllers/industryController');

/**
 * @route GET /api/industries
 * @desc Récupère toutes les industries avec support de recherche et pagination
 * @query {string} search - Terme de recherche optionnel
 * @query {number} page - Numéro de page pour la pagination
 * @query {number} limit - Nombre d'éléments par page
 * @access Public
 */
router.get('/', industryController.getAllIndustries);

/**
 * @route POST /api/industries
 * @desc Crée une nouvelle industrie
 * @body {string} name - Nom de l'industrie
 * @body {string} description - Description de l'industrie
 * @access Private (Admin)
 */
router.post('/', industryController.createIndustry);

/**
 * @route GET /api/industries/:id
 * @desc Récupère une industrie par son ID
 * @param {string} id - ID de l'industrie
 * @access Public
 */
router.get('/:id', industryController.getIndustryById);

/**
 * @route PUT /api/industries/:id
 * @desc Met à jour une industrie
 * @param {string} id - ID de l'industrie
 * @body {string} name - Nom de l'industrie
 * @body {string} description - Description de l'industrie
 * @access Private (Admin)
 */
router.put('/:id', industryController.updateIndustry);

/**
 * @route DELETE /api/industries/:id
 * @desc Supprime une industrie
 * @param {string} id - ID de l'industrie
 * @access Private (Admin)
 */
router.delete('/:id', industryController.deleteIndustry);

/**
 * @route PATCH /api/industries/:id/toggle-status
 * @desc Active/Désactive une industrie
 * @param {string} id - ID de l'industrie
 * @access Private (Admin)
 */
router.patch('/:id/toggle-status', industryController.toggleIndustryStatus);

export default router; 