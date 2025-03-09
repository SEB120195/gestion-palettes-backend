const express = require('express');
const { synchronize } = require('../controllers/syncController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Route de synchronisation protégée
router.post('/', protect, synchronize);

module.exports = router;