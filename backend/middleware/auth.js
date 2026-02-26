import db from '../models/db.js';

// Middleware d'authentification par session SQLite
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Non autorise', 
      message: 'Token manquant' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  // Vérifier la session dans la base SQLite
  const session = db.prepare(`
    SELECT s.*, u.id as user_id, u.email, u.name 
    FROM sessions s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token);

  if (!session) {
    return res.status(401).json({ 
      error: 'Non autorise', 
      message: 'Session invalide ou expiree' 
    });
  }

  req.userId = session.user_id;
  req.user = { id: session.user_id, email: session.email, name: session.name };
  next();
};

// Middleware optionnel (ne bloque pas si pas de token)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    const session = db.prepare(`
      SELECT s.*, u.id as user_id, u.email, u.name 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).get(token);
    
    if (session) {
      req.userId = session.user_id;
      req.user = { id: session.user_id, email: session.email, name: session.name };
    }
  }
  
  next();
};
