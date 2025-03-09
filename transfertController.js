const Transfert = require('../models/Transfert');
const Palette = require('../models/Palette');
const asyncHandler = require('express-async-handler');

// @desc    Obtenir tous les transferts
// @route   GET /api/transferts
// @access  Private
exports.getTransferts = asyncHandler(async (req, res) => {
  const transferts = await Transfert.find();
  
  res.json({
    success: true,
    count: transferts.length,
    data: transferts
  });
});

// @desc    Obtenir un transfert par ID
// @route   GET /api/transferts/:id
// @access  Private
exports.getTransfertById = asyncHandler(async (req, res) => {
  const transfert = await Transfert.findOne({ id: req.params.id });
  
  if (!transfert) {
    res.status(404);
    throw new Error('Transfert non trouvé');
  }
  
  res.json({
    success: true,
    data: transfert
  });
});

// @desc    Obtenir les transferts en cours
// @route   GET /api/transferts/encours
// @access  Private
exports.getTransfertsEnCours = asyncHandler(async (req, res) => {
  const transferts = await Transfert.find({ statut: 'En cours' });
  
  res.json({
    success: true,
    count: transferts.length,
    data: transferts
  });
});

// @desc    Obtenir l'historique des transferts
// @route   GET /api/transferts/historique
// @access  Private
exports.getHistoriqueTransferts = asyncHandler(async (req, res) => {
  const transferts = await Transfert.find({ 
    statut: { $in: ['Terminé', 'Annulé'] } 
  }).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: transferts.length,
    data: transferts
  });
});

// @desc    Créer un nouveau transfert
// @route   POST /api/transferts
// @access  Private
exports.createTransfert = asyncHandler(async (req, res) => {
  const { 
    paletteNumero, 
    lieuOrigine, 
    lieuDestination, 
    responsable,
    mettreALAbri,
    reserverPalette,
    descriptionReservation
  } = req.body;
  
  // Vérifier si la palette existe
  const palette = await Palette.findOne({ numero: paletteNumero });
  if (!palette) {
    res.status(404);
    throw new Error('Palette non trouvée');
  }
  
  // Vérifier si la palette est déjà en transfert
  if (palette.estEnTransfert) {
    res.status(400);
    throw new Error('Cette palette est déjà en transfert');
  }
  
  // Générer un ID unique
  const id = `TR${Date.now()}`;
  
  // Format de date jj/mm/aaaa
  const now = new Date();
  const dateCreation = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  
  // Créer le transfert
  const transfert = await Transfert.create({
    id,
    paletteNumero,
    lieuOrigine,
    lieuDestination,
    dateCreation,
    responsable,
    mettreALAbri: mettreALAbri || false,
    reserverPalette: reserverPalette || false,
    descriptionReservation
  });
  
  // Mettre à jour la palette
  await Palette.findOneAndUpdate(
    { numero: paletteNumero },
    { 
      estEnTransfert: true,
      transfertId: id
    }
  );
  
  res.status(201).json({
    success: true,
    data: transfert
  });
});

// @desc    Terminer un transfert
// @route   PUT /api/transferts/:id/terminer
// @access  Private
exports.terminerTransfert = asyncHandler(async (req, res) => {
  const { destinationFinale } = req.body;
  
  // Trouver le transfert
  const transfert = await Transfert.findOne({ id: req.params.id });
  if (!transfert) {
    res.status(404);
    throw new Error('Transfert non trouvé');
  }
  
  // Vérifier que le transfert est en cours
  if (transfert.statut !== 'En cours') {
    res.status(400);
    throw new Error('Ce transfert est déjà terminé ou annulé');
  }
  
  // Format de date jj/mm/aaaa
  const now = new Date();
  const dateFin = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  
  // Mettre à jour le transfert
  const updatedTransfert = await Transfert.findOneAndUpdate(
    { id: req.params.id },
    { 
      statut: 'Terminé',
      dateFin,
      lieuDestination: destinationFinale || transfert.lieuDestination
    },
    { new: true }
  );
  
  // Mettre à jour la palette
  const palette = await Palette.findOne({ numero: transfert.paletteNumero });
  if (palette) {
    const destination = destinationFinale || transfert.lieuDestination;
    
    const updateData = {
      lieuActuel: destination,
      estEnTransfert: false,
      transfertId: null
    };
    
    if (transfert.mettreALAbri) {
      updateData.estALAbri = true;
    }
    
    if (transfert.reserverPalette) {
      updateData.estReservee = true;
      updateData.descriptionReservation = transfert.descriptionReservation;
    }
    
    await Palette.findOneAndUpdate(
      { numero: transfert.paletteNumero },
      updateData
    );
  }
  
  res.json({
    success: true,
    data: updatedTransfert
  });
});

// @desc    Annuler un transfert
// @route   PUT /api/transferts/:id/annuler
// @access  Private
exports.annulerTransfert = asyncHandler(async (req, res) => {
  // Trouver le transfert
  const transfert = await Transfert.findOne({ id: req.params.id });
  if (!transfert) {
    res.status(404);
    throw new Error('Transfert non trouvé');
  }
  
  // Vérifier que le transfert est en cours
  if (transfert.statut !== 'En cours') {
    res.status(400);
    throw new Error('Ce transfert est déjà terminé ou annulé');
  }
  
  // Format de date jj/mm/aaaa
  const now = new Date();
  const dateFin = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  
  // Mettre à jour le transfert
  const updatedTransfert = await Transfert.findOneAndUpdate(
    { id: req.params.id },
    { 
      statut: 'Annulé',
      dateFin
    },
    { new: true }
  );
  
  // Mettre à jour la palette
  await Palette.findOneAndUpdate(
    { numero: transfert.paletteNumero },
    {
      estEnTransfert: false,
      transfertId: null
    }
  );
  
  res.json({
    success: true,
    data: updatedTransfert
  });
});