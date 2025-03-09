const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Options pour améliorer la stabilité de la connexion
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Option pour les connexions simultanées
      maxPoolSize: 10
      // Les options useNewUrlParser et useUnifiedTopology sont retirées car obsolètes
    });
    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    process.exit(1);
  }
};
module.exports = connectDB;