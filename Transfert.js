const mongoose = require('mongoose');

const transfertSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  paletteNumero: {
    type: String,
    required: true,
    ref: 'Palette'
  },
  lieuOrigine: {
    type: String,
    required: true
  },
  lieuDestination: {
    type: String,
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateFin: {
    type: Date,
    default: null
  },
  responsable: {
    type: String,
    required: true
  },
  statut: {
    type: String,
    enum: ['En cours', 'Terminé', 'Annulé'],
    default: 'En cours'
  },
  mettreALAbri: {
    type: Boolean,
    default: false
  },
  reserverPalette: {
    type: Boolean,
    default: false
  },
  descriptionReservation: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Méthode pour terminer un transfert
transfertSchema.methods.terminer = function() {
  this.statut = 'Terminé';
  this.dateFin = new Date();
  return this.save();
};

// Méthode pour annuler un transfert
transfertSchema.methods.annuler = function() {
  this.statut = 'Annulé';
  this.dateFin = new Date();
  return this.save();
};

module.exports = mongoose.model('Transfert', transfertSchema);