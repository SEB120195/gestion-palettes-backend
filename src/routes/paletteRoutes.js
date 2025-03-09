const express = require('express');
const { 
  getPalettes,
  getPaletteByNumero,
  getPalettesByLieu,
  getPalettesALAbri,
  getPalettesReservees,
  createPalette, 
  updatePalette,
  deletePalette  // N'oubliez pas d'importer la nouvelle méthode de suppression
} = require('../controllers/paletteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes : nécessite une authentification
router.use(protect);

// Routes de collection : obtenir toutes les palettes ou en créer une nouvelle
router.route('/')
  .get(getPalettes)     // Récupérer toutes les palettes
  .post(createPalette); // Créer une nouvelle palette

// Routes de filtrage spécifique
router.get('/abri', getPalettesALAbri);        // Palettes à l'abri
router.get('/reservees', getPalettesReservees); // Palettes réservées
router.get('/lieu/:lieu', getPalettesByLieu);   // Palettes par lieu

// Routes par identifiant (numéro de palette)
router.route('/:numero')
  .get(getPaletteByNumero)  // Obtenir une palette par son numéro
  .put(updatePalette)       // Mettre à jour une palette
  .delete(deletePalette);   // Supprimer une palette

module.exports = router;
