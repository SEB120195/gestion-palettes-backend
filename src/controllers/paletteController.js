const Palette = require('../models/Palette');
const asyncHandler = require('express-async-handler');

// @desc    Obtenir toutes les palettes
// @route   GET /api/palettes
// @access  Private
exports.getPalettes = asyncHandler(async (req, res) => {
  const { 
    lieuActuel, 
    estReservee, 
    estALAbri, 
    estEnTransfert 
  } = req.query;
  const filter = {};
  if (lieuActuel) filter.lieuActuel = lieuActuel;
  if (estReservee) filter.estReservee = estReservee === 'true';
  if (estALAbri) filter.estALAbri = estALAbri === 'true';
  if (estEnTransfert) filter.estEnTransfert = estEnTransfert === 'true';
  const palettes = await Palette.find(filter);
  
  res.json({
    success: true,
    count: palettes.length,
    data: palettes
  });
});

// @desc    Obtenir une palette par numéro
// @route   GET /api/palettes/:numero
// @access  Private
exports.getPaletteByNumero = asyncHandler(async (req, res) => {
  const palette = await Palette.findOne({ numero: req.params.numero });
  
  if (!palette) {
    res.status(404);
    throw new Error('Palette non trouvée');
  }
  
  res.json({
    success: true,
    data: palette
  });
});

// @desc    Obtenir les palettes par lieu
// @route   GET /api/palettes/lieu/:lieu
// @access  Private
exports.getPalettesByLieu = asyncHandler(async (req, res) => {
  const palettes = await Palette.find({ lieuActuel: req.params.lieu });
  
  res.json({
    success: true,
    count: palettes.length,
    data: palettes
  });
});

// @desc    Obtenir les palettes à l'abri
// @route   GET /api/palettes/abri
// @access  Private
exports.getPalettesALAbri = asyncHandler(async (req, res) => {
  const palettes = await Palette.find({ estALAbri: true });
  
  res.json({
    success: true,
    count: palettes.length,
    data: palettes
  });
});

// @desc    Obtenir les palettes réservées
// @route   GET /api/palettes/reservees
// @access  Private
exports.getPalettesReservees = asyncHandler(async (req, res) => {
  const palettes = await Palette.find({ estReservee: true });
  
  res.json({
    success: true,
    count: palettes.length,
    data: palettes
  });
});

// @desc    Créer une nouvelle palette
// @route   POST /api/palettes
// @access  Private
exports.createPalette = asyncHandler(async (req, res) => {
  const { numero } = req.body;
  // Vérifier si une palette avec ce numéro existe déjà
  const paletteExists = await Palette.findOne({ numero });
  if (paletteExists) {
    res.status(400);
    throw new Error('Une palette avec ce numéro existe déjà');
  }
  const palette = await Palette.create(req.body);
  
  res.status(201).json({
    success: true,
    data: palette
  });
});

// @desc    Mettre à jour une palette
// @route   PUT /api/palettes/:numero
// @access  Private
exports.updatePalette = asyncHandler(async (req, res) => {
  let palette = await Palette.findOne({ numero: req.params.numero });
  
  if (!palette) {
    res.status(404);
    throw new Error('Palette non trouvée');
  }
  
  // Empêcher la modification du numéro de palette
  if (req.body.numero) {
    delete req.body.numero;
  }
  palette = await Palette.findOneAndUpdate(
    { numero: req.params.numero },
    req.body,
    { 
      new: true, 
      runValidators: true 
    }
  );
  
  res.json({
    success: true,
    data: palette
  });
});

// @desc    Supprimer une palette
// @route   DELETE /api/palettes/:numero
// @access  Private
exports.deletePalette = asyncHandler(async (req, res) => {
  const palette = await Palette.findOne({ numero: req.params.numero });
  
  if (!palette) {
    res.status(404);
    throw new Error('Palette non trouvée');
  }
  await palette.deleteOne();
  res.json({
    success: true,
    message: 'Palette supprimée avec succès'
  });
});
