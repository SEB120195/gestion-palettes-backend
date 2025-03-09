const errorHandler = (err, req, res, next) => {
  // Définir le code de statut
  const statusCode = err.statusCode || 500;
  
  // Préparer la réponse d'erreur
  const errorResponse = {
    success: false,
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Gestion des erreurs spécifiques de Mongoose
  if (err.name === 'ValidationError') {
    errorResponse.message = Object.values(err.errors)
      .map(error => error.message)
      .join(', ');
    errorResponse.statusCode = 400;
  }

  // Gestion de l'erreur de doublon (code d'erreur MongoDB)
  if (err.code === 11000) {
    errorResponse.message = 'Un enregistrement avec ces données existe déjà';
    errorResponse.statusCode = 409;
  }

  // Journalisation de l'erreur (vous pouvez ajouter un système de logging plus avancé plus tard)
  console.error(err);

  // Envoyer la réponse d'erreur
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
