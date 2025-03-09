const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Enregistrer un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  console.log('Tentative d\'inscription:', { name, email }); // Log de débogage

  // Validation des données d'entrée
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Veuillez remplir tous les champs');
  }

  // Validation du format de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Format d\'email invalide');
  }

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Un utilisateur avec cet email existe déjà');
  }

  // Créer l'utilisateur (le hachage se fait dans le modèle)
  const user = await User.create({
    name,
    email,
    password
  });

  if (user) {
    console.log('Utilisateur créé avec succès:', user._id); // Log de débogage
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: user.generateToken()
      }
    });
  } else {
    res.status(400);
    throw new Error('Données utilisateur invalides');
  }
});

// @desc    Authentifier un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('Tentative de connexion:', { email }); // Log de débogage

  // Validation des données d'entrée
  if (!email || !password) {
    res.status(400);
    throw new Error('Veuillez fournir un email et un mot de passe');
  }

  // Rechercher l'utilisateur en incluant le mot de passe
  const user = await User.findOne({ email }).select('+password');
  
  console.log('Utilisateur trouvé:', user ? user.email : 'Aucun'); // Log de débogage

  if (!user) {
    res.status(401);
    throw new Error('Utilisateur non trouvé');
  }

  // Vérifier le mot de passe directement avec bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  
  console.log('Correspondance du mot de passe:', isMatch); // Log de débogage

  if (isMatch) {
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: user.generateToken()
      }
    });
  } else {
    res.status(401);
    throw new Error('Mot de passe incorrect');
  }
});

// @desc    Obtenir le profil utilisateur
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  res.json({
    success: true,
    data: user
  });
});