import express from 'express';
const router = express.Router();
import companyController from '../controllers/CompanyController';

// Route to add a new company
router.post('/add', (req, res) => companyController.create(req, res));

export default router; 