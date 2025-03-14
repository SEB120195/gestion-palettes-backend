// Chargement des variables d'environnement en premier
require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI); // Pour vérifier que la variable est bien chargée

console.time('App startup');
console.time('Module loading');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
console.timeEnd('Module loading');

const app = express();

// Middlewares (rapides à initialiser)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route de test simple directement dans le fichier principal
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Le serveur fonctionne correctement' });
});

// Ajouter un middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Démarrage asynchrone de l'application
const startServer = async () => {
  try {
    // Connexion à la base de données
    console.time('MongoDB connection');
    await connectDB();
    console.timeEnd('MongoDB connection');
    
    // Ajout progressif des routes - une par une
    console.time('Routes initialization');
    
    // Activer les routes une par une pour trouver laquelle pose problème
    // Si le serveur démarre correctement avec cette route, décommentez la suivante
    const authRoutes = require('./src/routes/authRoutes');
    app.use('/api/auth', authRoutes);
    
    // Si l'erreur se reproduit après avoir décommenté une route, c'est celle-ci qui pose problème
    try {
      const paletteRoutes = require('./src/routes/paletteRoutes');
      app.use('/api/palettes', paletteRoutes);
      console.log('Routes des palettes chargées avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement des routes de palettes:', error);
    }
    
    try {
      const transfertRoutes = require('./src/routes/transfertRoutes');
      app.use('/api/transferts', transfertRoutes);
      console.log('Routes des transferts chargées avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement des routes de transferts:', error);
    }
    
    try {
      const syncRoutes = require('./src/routes/syncRoutes');
      app.use('/api/sync', syncRoutes);
      console.log('Routes de synchronisation chargées avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement des routes de synchronisation:', error);
    }
    
    console.timeEnd('Routes initialization');
    
    // Gestionnaire d'erreurs global
    app.use(errorHandler);
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`Accessible à http://localhost:${PORT} et http://192.168.1.63:${PORT}`);   
      console.timeEnd('App startup');
    });
  } catch (error) {
    console.error('Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
};

// Lancement du serveur
startServer();