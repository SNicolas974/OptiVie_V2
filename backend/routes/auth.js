import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../models/db.js';

const router = express.Router();

// Générer un token de session simple
const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Durée de session : 30 jours
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// Middleware d'authentification par session
export const sessionAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Non autorise', 
      message: 'Token manquant' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  // Vérifier la session dans la base
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

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Donnees manquantes',
        message: 'Email et mot de passe requis'
      });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());

    if (existingUser) {
      return res.status(400).json({
        error: 'Email existant',
        message: 'Un compte existe deja avec cet email'
      });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const insertUser = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
    const result = insertUser.run(email.toLowerCase(), hashedPassword, name || null);
    const userId = result.lastInsertRowid;

    // Créer le profil vide
    db.prepare('INSERT INTO user_profiles (user_id) VALUES (?)').run(userId);

    // Créer une session
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(userId, token, expiresAt);

    // Récupérer l'utilisateur créé
    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(userId);

    res.status(201).json({
      message: 'Compte cree avec succes',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de creer le compte'
    });
  }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Donnees manquantes',
        message: 'Email et mot de passe requis'
      });
    }

    // Trouver l'utilisateur
    const user = db.prepare('SELECT id, email, password, name FROM users WHERE email = ?').get(email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        error: 'Identifiants incorrects',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Identifiants incorrects',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Supprimer les anciennes sessions expirées de cet utilisateur
    db.prepare("DELETE FROM sessions WHERE user_id = ? AND expires_at <= datetime('now')").run(user.id);

    // Créer une nouvelle session
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, token, expiresAt);

    // Récupérer les objectifs
    const goals = db.prepare('SELECT goal_type FROM health_goals WHERE user_id = ? AND is_active = 1').all(user.id);

    res.json({
      message: 'Connexion reussie',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        goals: goals.map(g => g.goal_type)
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de se connecter'
    });
  }
});

// POST /api/auth/logout - Déconnexion
router.post('/logout', sessionAuth, (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    
    // Supprimer la session
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);

    res.json({ message: 'Deconnexion reussie' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de se deconnecter'
    });
  }
});

// GET /api/auth/me - Obtenir profil utilisateur
router.get('/me', sessionAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(req.userId);

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouve'
      });
    }

    // Récupérer le profil
    const profile = db.prepare(`
      SELECT age, gender, weight, height, activity_level, dietary_restrictions, allergies 
      FROM user_profiles WHERE user_id = ?
    `).get(req.userId);

    // Récupérer les objectifs
    const goals = db.prepare('SELECT goal_type FROM health_goals WHERE user_id = ? AND is_active = 1').all(req.userId);

    // Parser les restrictions et allergies (stockés en JSON)
    let parsedProfile = profile || {};
    if (profile) {
      try {
        parsedProfile.dietary_restrictions = profile.dietary_restrictions ? JSON.parse(profile.dietary_restrictions) : [];
        parsedProfile.allergies = profile.allergies ? JSON.parse(profile.allergies) : [];
      } catch {
        parsedProfile.dietary_restrictions = [];
        parsedProfile.allergies = [];
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      profile: parsedProfile,
      goals: goals.map(g => g.goal_type)
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});

// Export du middleware pour utilisation dans d'autres routes
export { sessionAuth as authMiddleware };
export default router;
