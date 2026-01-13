import express from 'express';
import { addressController } from '../controllers/AddressController';

const router = express.Router();

// Créer une nouvelle adresse
router.post('/', addressController.createAddress);

// Récupérer une adresse existante
router.get('/:addressId', addressController.getAddress);

export default router;
