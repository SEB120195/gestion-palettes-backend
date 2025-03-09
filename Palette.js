const mongoose = require('mongoose');

const paletteSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  lieuActuel: {
    type: String,
    required: true
  },
  estReservee: {
    type: Boolean,
    default: false
  },
  descriptionReservation: {
    type: String,
    default: null
  },
  estALAbri: {
    type: Boolean,
    default: false
  },
  estEnTransfert: {
    type: Boolean,
    default: false
  },
  transfertId: {
    type: String,
    default: null
  },
  historique: [{
    lieu: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Middleware pour mettre à jour l'historique
paletteSchema.pre('save', function(next) {
  // Vérifier si le lieu actuel a changé
  if (this.isModified('lieuActuel')) {
    this.historique.push({
      lieu: this.lieuActuel
    });
  }
  next();
});

// Méthode pour vérifier la disponibilité
paletteSchema.methods.estDisponible = function() {
  return !this.estReservee && !this.estEnTransfert;
};

module.exports = mongoose.model('Palette', paletteSchema);