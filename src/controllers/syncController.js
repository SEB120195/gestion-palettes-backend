const Palette = require('../models/Palette');
const Transfert = require('../models/Transfert');
const asyncHandler = require('express-async-handler');

// @desc    Synchroniser les données
// @route   POST /api/sync
// @access  Private
exports.synchronize = asyncHandler(async (req, res) => {
  const { palettes, transferts } = req.body;

  try {
    // Synchronisation des palettes
    if (palettes && palettes.length > 0) {
      for (const palette of palettes) {
        await Palette.findOneAndUpdate(
          { numero: palette.numero },
          palette,
          { upsert: true, new: true }
        );
      }
    }

    // Synchronisation des transferts
    if (transferts && transferts.length > 0) {
      for (const transfert of transferts) {
        await Transfert.findOneAndUpdate(
          { id: transfert.id },
          transfert,
          { upsert: true, new: true }
        );
      }
    }

    // Récupérer les données mises à jour
    const updatedPalettes = await Palette.find();
    const updatedTransferts = await Transfert.find();

    res.json({
      success: true,
      data: {
        palettes: updatedPalettes,
        transferts: updatedTransferts
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error('Erreur lors de la synchronisation des données');
  }
});
