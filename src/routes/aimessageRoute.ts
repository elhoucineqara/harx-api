import express from 'express';
const router = express.Router();
const aiMessageController = require('../../controllers/aimessageController');

// Route pour créer un nouveau message
router.post('/messages', aiMessageController.createMessage);
// Route pour créer plusieurs messages en une seule requête
router.post('/messages/batch', aiMessageController.createMessagesBatch);

// Route pour obtenir les messages par ID d'appel
router.get('/messages/call/:callId', aiMessageController.getMessagesByCallId);

// Route pour obtenir les messages par catégorie
router.get('/messages/category/:category', aiMessageController.getMessagesByCategory);

// Route pour mettre à jour un message
router.put('/messages/:messageId', aiMessageController.updateMessage);

// Route pour supprimer un message
router.delete('/messages/:messageId', aiMessageController.deleteMessage);

// Route pour obtenir les messages par plage de temps
router.get('/messages/timerange', aiMessageController.getMessagesByTimeRange);

// Route pour obtenir les messages par priorité
router.get('/messages/priority/:priority', aiMessageController.getMessagesByPriority);

export default router; 