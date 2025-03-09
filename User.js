const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hachage du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Uniquement hacher si le mot de passe a été modifié
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode de vérification du mot de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Génération du token JWT
userSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET || 'your_jwt_secret', // Fallback secret
    { 
      expiresIn: process.env.JWT_EXPIRE || '30d' // Fallback expiration
    }
  );
};

module.exports = mongoose.model('User', userSchema);