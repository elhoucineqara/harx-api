import express from 'express';
import sectorController from '../controllers/SectorController';

const router = express.Router();

// Récupérer tous les secteurs
router.get('/', sectorController.getAll);

// Récupérer un secteur par ID
router.get('/:id', sectorController.getById);

// Créer un nouveau secteur
router.post('/', sectorController.create);

// Mettre à jour un secteur
router.put('/:id', sectorController.update);

// Supprimer un secteur
router.delete('/:id', sectorController.delete);

export default router;
