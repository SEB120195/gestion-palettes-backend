const express = require('express');
const { 
  register, 
  login, 
  getUserProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées
router.get('/profile', protect, getUserProfile);

module.exports = router;
