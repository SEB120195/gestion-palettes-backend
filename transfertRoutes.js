const express = require('express');
const { 
  getTransferts,
  getTransfertById,
  getTransfertsEnCours,
  getHistoriqueTransferts,
  createTransfert,
  terminerTransfert,
  annulerTransfert
} = require('../controllers/transfertController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

// Routes pour les collections
router.route('/')
  .get(getTransferts)
  .post(createTransfert);

// Routes spécifiques
router.get('/encours', getTransfertsEnCours);
router.get('/historique', getHistoriqueTransferts);

// Routes par identifiant
router.route('/:id')
  .get(getTransfertById);

// Routes d'actions
router.put('/:id/terminer', terminerTransfert);
router.put('/:id/annuler', annulerTransfert);

module.exports = router;