import express from 'express';
import CountryController from '../controllers/CountryController';

const router = express.Router();

// Get all countries
router.get('/', (req, res) => CountryController.getAll(req, res));

// Get country by ID
router.get('/:id', (req, res) => CountryController.getById(req, res));

// Create a new country
router.post('/', (req, res) => CountryController.create(req, res));

// Update a country
router.put('/:id', (req, res) => CountryController.update(req, res));

// Delete a country
router.delete('/:id', (req, res) => CountryController.delete(req, res));

// Routes not implemented in controller yet:
// router.get('/code/:code', CountryController.getCountryByCode);
// router.post('/multiple', CountryController.createMultipleCountries);

export default router;
