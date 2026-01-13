import express from 'express';
import CurrencyController from '../controllers/CurrencyController';

const router = express.Router();

// Get all currencies
router.get('/', (req, res) => CurrencyController.getAll(req, res));

// Get currency by ID
router.get('/:id', (req, res) => CurrencyController.getById(req, res));

// Create a new currency
router.post('/', (req, res) => CurrencyController.create(req, res));

// Update a currency
router.put('/:id', (req, res) => CurrencyController.update(req, res));

// Delete a currency
router.delete('/:id', (req, res) => CurrencyController.delete(req, res));

// Routes not implemented in controller yet:
// router.get('/stats', CurrencyController.getCurrencyStats);
// router.post('/seed', CurrencyController.seedCurrencies);
// router.get('/code/:code', CurrencyController.getCurrencyByCode);

export default router;
