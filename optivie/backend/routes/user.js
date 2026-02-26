import express from 'express';
import db from '../models/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Liste des objectifs de sante disponibles
export const HEALTH_GOALS = {
  weight_loss: {
    label: 'Perte de poids',
    description: 'Reduire la masse grasse et atteindre un poids sante',
    focus: 'Aliments a faible densite calorique, riches en fibres, IG bas'
  },
  mental_health: {
    label: 'Sante mentale',
    description: 'Ameliorer humeur, reduire anxiete et depression',
    focus: 'Omega-3, magnesium, vitamines B, tryptophane'
  },
  painful_periods: {
    label: 'Regles douloureuses',
    description: 'Reduire les douleurs menstruelles et syndrome premenstruel',
    focus: 'Omega-3, magnesium, vitamine E, eviter aliments inflammatoires'
  },
  joint_pain: {
    label: 'Douleurs articulaires',
    description: 'Soulager arthrite, arthrose et inflammations articulaires',
    focus: 'Omega-3, curcuma, gingembre, collagene, eviter sucres'
  },
  digestive_health: {
    label: 'Sante digestive',
    description: 'Ameliorer digestion, reduire ballonnements et inflammations intestinales',
    focus: 'Fibres, probiotiques, aliments fermentes, eviter irritants'
  },
  skin_health: {
    label: 'Sante de la peau',
    description: 'Reduire acne, eczema, psoriasis et vieillissement cutane',
    focus: 'Antioxydants, omega-3, zinc, vitamine A, eviter sucres'
  },
  energy_boost: {
    label: 'Boost energie',
    description: 'Combattre la fatigue et augmenter vitalite',
    focus: 'Fer, vitamines B, magnesium, IG bas pour energie stable'
  },
  anti_aging: {
    label: 'Anti-age',
    description: 'Ralentir le vieillissement cellulaire',
    focus: 'Antioxydants, polyphenols, omega-3, eviter sucres et fritures'
  },
  immune_boost: {
    label: 'Renforcer immunite',
    description: 'Booster les defenses immunitaires',
    focus: 'Vitamine C, D, zinc, selenium, probiotiques'
  },
  heart_health: {
    label: 'Sante cardiaque',
    description: 'Proteger le coeur et les vaisseaux',
    focus: 'Omega-3, fibres, potassium, eviter graisses saturees et sel'
  }
};

// GET /api/user/goals/list - Liste des objectifs disponibles
router.get('/goals/list', (req, res) => {
  const goals = Object.entries(HEALTH_GOALS).map(([key, value]) => ({
    id: key,
    ...value
  }));
  res.json({ goals });
});

// GET /api/user/goals - Obtenir les objectifs de l'utilisateur
router.get('/goals', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT goal_type, created_at FROM health_goals WHERE user_id = ? AND is_active = 1'
    ).all(req.userId);

    const goals = rows.map(row => ({
      id: row.goal_type,
      ...HEALTH_GOALS[row.goal_type],
      added_at: row.created_at
    }));

    res.json({ goals });

  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/user/goals - Mettre a jour les objectifs
router.put('/goals', authMiddleware, (req, res) => {
  try {
    const { goals } = req.body; // Array of goal_type strings

    if (!Array.isArray(goals)) {
      return res.status(400).json({
        error: 'Format invalide',
        message: 'goals doit etre un tableau'
      });
    }

    // Validate goal types
    const validGoals = goals.filter(g => HEALTH_GOALS[g]);

    // Transaction pour atomicité
    const transaction = db.transaction(() => {
      // Supprimer tous les objectifs actuels de l'utilisateur
      db.prepare('DELETE FROM health_goals WHERE user_id = ?').run(req.userId);

      // Insérer les nouveaux objectifs
      const insertStmt = db.prepare('INSERT INTO health_goals (user_id, goal_type, is_active) VALUES (?, ?, 1)');
      
      for (const goalType of validGoals) {
        insertStmt.run(req.userId, goalType);
      }
    });

    transaction();

    res.json({
      message: 'Objectifs mis a jour',
      goals: validGoals.map(g => ({ id: g, ...HEALTH_GOALS[g] }))
    });

  } catch (error) {
    console.error('Update goals error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/user/profile - Obtenir le profil
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const profile = db.prepare(
      'SELECT age, gender, weight, height, activity_level, dietary_restrictions, allergies FROM user_profiles WHERE user_id = ?'
    ).get(req.userId);

    // Parser les champs JSON
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

    res.json({ profile: parsedProfile });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/user/profile - Mettre a jour le profil
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { age, gender, weight, height, activity_level, dietary_restrictions, allergies } = req.body;

    // Convertir les tableaux en JSON pour SQLite
    const restrictionsJson = dietary_restrictions ? JSON.stringify(dietary_restrictions) : null;
    const allergiesJson = allergies ? JSON.stringify(allergies) : null;

    // Vérifier si le profil existe
    const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(req.userId);

    if (existing) {
      db.prepare(`
        UPDATE user_profiles 
        SET age = COALESCE(?, age),
            gender = COALESCE(?, gender),
            weight = COALESCE(?, weight),
            height = COALESCE(?, height),
            activity_level = COALESCE(?, activity_level),
            dietary_restrictions = COALESCE(?, dietary_restrictions),
            allergies = COALESCE(?, allergies),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(age, gender, weight, height, activity_level, restrictionsJson, allergiesJson, req.userId);
    } else {
      db.prepare(`
        INSERT INTO user_profiles (user_id, age, gender, weight, height, activity_level, dietary_restrictions, allergies)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.userId, age, gender, weight, height, activity_level, restrictionsJson, allergiesJson);
    }

    const profile = db.prepare(
      'SELECT age, gender, weight, height, activity_level, dietary_restrictions, allergies FROM user_profiles WHERE user_id = ?'
    ).get(req.userId);

    // Parser les champs JSON
    let parsedProfile = profile;
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
      message: 'Profil mis a jour',
      profile: parsedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/user/history - Historique des analyses
router.get('/history', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, plat, score_global, ingredients, created_at 
      FROM analysis_history 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(req.userId);

    // Parser le JSON des ingrédients
    const history = rows.map(row => ({
      ...row,
      ingredients: row.ingredients ? JSON.parse(row.ingredients) : null
    }));

    res.json({ history });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
