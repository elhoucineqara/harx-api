import express from 'express';
const router = express.Router();
const activityController = require('../../controllers/activityController');

/**
 * @route GET /api/activities
 * @desc Récupère toutes les activités avec support de recherche, filtrage et pagination
 * @query {string} search - Terme de recherche optionnel
 * @query {string} category - Filtrage par catégorie
 * @query {number} page - Numéro de page pour la pagination
 * @query {number} limit - Nombre d'éléments par page
 * @access Public
 */
router.get('/', activityController.getAllActivities);

/**
 * @route GET /api/activities/categories
 * @desc Récupère toutes les catégories d'activités disponibles
 * @access Public
 */
router.get('/categories', activityController.getActivityCategories);

/**
 * @route GET /api/activities/category/:category
 * @desc Récupère les activités par catégorie
 * @param {string} category - Catégorie des activités
 * @access Public
 */
router.get('/category/:category', activityController.getActivitiesByCategory);

/**
 * @route POST /api/activities
 * @desc Crée une nouvelle activité
 * @body {string} name - Nom de l'activité
 * @body {string} description - Description de l'activité
 * @body {string} category - Catégorie de l'activité
 * @access Private (Admin)
 */
router.post('/', activityController.createActivity);

/**
 * @route GET /api/activities/:id
 * @desc Récupère une activité par son ID
 * @param {string} id - ID de l'activité
 * @access Public
 */
router.get('/:id', activityController.getActivityById);

/**
 * @route PUT /api/activities/:id
 * @desc Met à jour une activité
 * @param {string} id - ID de l'activité
 * @body {string} name - Nom de l'activité
 * @body {string} description - Description de l'activité
 * @body {string} category - Catégorie de l'activité
 * @access Private (Admin)
 */
router.put('/:id', activityController.updateActivity);

/**
 * @route DELETE /api/activities/:id
 * @desc Supprime une activité
 * @param {string} id - ID de l'activité
 * @access Private (Admin)
 */
router.delete('/:id', activityController.deleteActivity);

/**
 * @route PATCH /api/activities/:id/toggle-status
 * @desc Active/Désactive une activité
 * @param {string} id - ID de l'activité
 * @access Private (Admin)
 */
router.patch('/:id/toggle-status', activityController.toggleActivityStatus);

export default router; 