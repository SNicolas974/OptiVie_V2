import express from 'express';
import db from '../models/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Conseils personnalisés par profil et objectifs
const PERSONALIZED_TIPS = {
  // Par objectif de santé
  weight_loss: [
    { id: 'wl1', title: 'Privilegiez les fibres', text: 'Les legumes verts et cereales completes augmentent la satiete. Visez 30g de fibres par jour.', emoji: '🥬' },
    { id: 'wl2', title: 'Attention aux sauces', text: 'Les sauces industrielles cachent souvent beaucoup de sucres et graisses. Preparez les votres!', emoji: '🍶' },
    { id: 'wl3', title: 'Mastiquez lentement', text: 'Manger lentement aide a mieux ressentir la satiete et reduit les quantites consommees.', emoji: '⏱️' },
  ],
  mental_health: [
    { id: 'mh1', title: 'Omega-3 pour le cerveau', text: 'Les poissons gras (sardines, maquereaux) sont excellents pour l\'humeur. 2-3 fois par semaine.', emoji: '🐟' },
    { id: 'mh2', title: 'Magnesium anti-stress', text: 'Chocolat noir, amandes, epinards sont riches en magnesium, mineral anti-stress.', emoji: '🍫' },
    { id: 'mh3', title: 'Intestin = 2eme cerveau', text: 'Les aliments fermentes (yaourt, kefir) nourrissent votre microbiote et ameliorent l\'humeur.', emoji: '🧠' },
  ],
  painful_periods: [
    { id: 'pp1', title: 'Anti-inflammatoires naturels', text: 'Curcuma, gingembre et omega-3 reduisent les douleurs menstruelles naturellement.', emoji: '🌿' },
    { id: 'pp2', title: 'Evitez le sel avant les regles', text: 'Le sel augmente la retention d\'eau et les ballonnements. Reduisez 5 jours avant.', emoji: '🧂' },
    { id: 'pp3', title: 'Fer et vitamine C', text: 'Compensez les pertes avec des lentilles + citron pour une meilleure absorption du fer.', emoji: '🍋' },
  ],
  joint_pain: [
    { id: 'jp1', title: 'Curcuma + poivre noir', text: 'Cette combinaison multiplie par 20 l\'absorption de la curcumine anti-inflammatoire.', emoji: '🌶️' },
    { id: 'jp2', title: 'Collagene naturel', text: 'Le bouillon d\'os maison est riche en collagene benefique pour les articulations.', emoji: '🍖' },
    { id: 'jp3', title: 'Evitez les sucres rapides', text: 'Le sucre augmente l\'inflammation. Preferez les fruits entiers aux jus.', emoji: '🍎' },
  ],
  digestive_health: [
    { id: 'dh1', title: 'Fibres progressives', text: 'Augmentez les fibres graduellement pour eviter ballonnements. +5g par semaine.', emoji: '📈' },
    { id: 'dh2', title: 'Probiotiques quotidiens', text: 'Un yaourt nature ou du kefir chaque jour renforce votre flore intestinale.', emoji: '🥛' },
    { id: 'dh3', title: 'Macher, macher, macher', text: 'La digestion commence dans la bouche. 20 mastications par bouchee minimum!', emoji: '👄' },
  ],
  skin_health: [
    { id: 'sh1', title: 'Hydratation de l\'interieur', text: 'Concombre, pasteque, tomates... Les aliments riches en eau hydratent la peau.', emoji: '💧' },
    { id: 'sh2', title: 'Zinc pour l\'acne', text: 'Huitres, graines de courge, boeuf sont riches en zinc, mineral anti-acne.', emoji: '✨' },
    { id: 'sh3', title: 'Moins de produits laitiers', text: 'Pour certains, reduire les produits laitiers ameliore significativement la peau.', emoji: '🥛' },
  ],
  energy_boost: [
    { id: 'eb1', title: 'Petit-dejeuner proteine', text: 'Des oeufs ou du fromage blanc le matin evitent le coup de pompe de 11h.', emoji: '🍳' },
    { id: 'eb2', title: 'Fer + Vitamine C', text: 'La fatigue peut venir d\'une carence en fer. Epinards + agrumes = combo gagnant.', emoji: '🍊' },
    { id: 'eb3', title: 'Index glycemique bas', text: 'Preferez quinoa, patate douce, legumineuses pour une energie stable toute la journee.', emoji: '⚡' },
  ],
  anti_aging: [
    { id: 'aa1', title: 'Antioxydants colores', text: 'Plus un aliment est colore, plus il contient d\'antioxydants. Variez les couleurs!', emoji: '🌈' },
    { id: 'aa2', title: 'Resveratrol du raisin', text: 'Raisin rouge, myrtilles, mures contiennent des polyphenols anti-vieillissement.', emoji: '🍇' },
    { id: 'aa3', title: 'Limitez les grillades', text: 'La cuisson a haute temperature cree des AGEs qui accelerent le vieillissement.', emoji: '🍖' },
  ],
  immune_boost: [
    { id: 'ib1', title: 'Vitamine D quotidienne', text: 'En hiver, champignons et poissons gras compensent le manque de soleil.', emoji: '☀️' },
    { id: 'ib2', title: 'Ail et oignon', text: 'Ces alliaces sont de puissants antibacteriens naturels. Consommez-les crus si possible.', emoji: '🧄' },
    { id: 'ib3', title: 'Zinc pour l\'immunite', text: 'Fruits de mer, viande rouge, graines de courge boostent vos defenses.', emoji: '🛡️' },
  ],
  heart_health: [
    { id: 'hh1', title: 'Omega-3 marins', text: 'Sardines, maquereaux, saumon 2-3 fois par semaine protegent votre coeur.', emoji: '❤️' },
    { id: 'hh2', title: 'Moins de sel', text: 'Remplacez le sel par des herbes et epices. Votre tension vous remerciera.', emoji: '🧂' },
    { id: 'hh3', title: 'Fibres solubles', text: 'Avoine, pommes, legumineuses reduisent le cholesterol naturellement.', emoji: '🍏' },
  ],

  // Par niveau d'activité
  sedentaire: [
    { id: 'sed1', title: 'Portions adaptees', text: 'Avec peu d\'activite, reduisez les feculents et augmentez les legumes.', emoji: '🥗' },
  ],
  actif: [
    { id: 'act1', title: 'Proteines post-effort', text: 'Consommez des proteines dans les 30 min apres l\'exercice pour la recuperation.', emoji: '💪' },
  ],
  athlete: [
    { id: 'ath1', title: 'Glucides complexes', text: 'Avant l\'effort, privilegiez riz complet, pates completes pour l\'endurance.', emoji: '🏆' },
  ],

  // Par restriction alimentaire
  vegetarien: [
    { id: 'veg1', title: 'Combinez les proteines', text: 'Cereales + legumineuses = proteines completes. Ex: riz + lentilles.', emoji: '🌱' },
  ],
  vegan: [
    { id: 'vgn1', title: 'B12 indispensable', text: 'La vitamine B12 n\'existe pas dans les vegetaux. Pensez a la supplementation.', emoji: '💊' },
  ],
  sans_gluten: [
    { id: 'sg1', title: 'Alternatives savoureuses', text: 'Quinoa, sarrasin, riz sont naturellement sans gluten et nutritifs.', emoji: '🌾' },
  ],

  // Par genre
  femme: [
    { id: 'fem1', title: 'Fer et acide folique', text: 'Les femmes ont des besoins accrus en fer. Lentilles, epinards, viande rouge.', emoji: '👩' },
  ],
  homme: [
    { id: 'hom1', title: 'Lycopene protecteur', text: 'La tomate cuite est riche en lycopene, benefique pour la prostate.', emoji: '🍅' },
  ],

  // Par tranche d'âge
  young: [
    { id: 'yng1', title: 'Calcium pour les os', text: 'Avant 30 ans, construisez votre capital osseux: produits laitiers, amandes, brocoli.', emoji: '🦴' },
  ],
  senior: [
    { id: 'snr1', title: 'Proteines renforcees', text: 'Apres 50 ans, augmentez les proteines pour maintenir la masse musculaire.', emoji: '🥩' },
  ],
};

// Helper: Obtenir les conseils personnalisés pour un utilisateur
const getPersonalizedTips = (userId, limit = 3) => {
  // Récupérer le profil et les objectifs
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);
  const goals = db.prepare('SELECT goal_type FROM health_goals WHERE user_id = ? AND is_active = 1').all(userId);
  
  // Récupérer les conseils déjà vus récemment (dernières 24h)
  const recentTips = db.prepare(`
    SELECT tip_id FROM personalized_tips 
    WHERE user_id = ? AND shown_at > datetime('now', '-1 day')
  `).all(userId).map(t => t.tip_id);

  let allTips = [];

  // Ajouter les conseils par objectif
  for (const goal of goals) {
    const tips = PERSONALIZED_TIPS[goal.goal_type] || [];
    allTips.push(...tips.map(t => ({ ...t, category: 'goal', source: goal.goal_type })));
  }

  // Ajouter les conseils par profil
  if (profile) {
    // Par genre
    if (profile.gender && PERSONALIZED_TIPS[profile.gender]) {
      allTips.push(...PERSONALIZED_TIPS[profile.gender].map(t => ({ ...t, category: 'profile', source: profile.gender })));
    }

    // Par âge
    if (profile.age) {
      if (profile.age < 35) {
        allTips.push(...(PERSONALIZED_TIPS.young || []).map(t => ({ ...t, category: 'age', source: 'young' })));
      } else if (profile.age >= 50) {
        allTips.push(...(PERSONALIZED_TIPS.senior || []).map(t => ({ ...t, category: 'age', source: 'senior' })));
      }
    }

    // Par niveau d'activité
    if (profile.activity_level) {
      const activityTips = PERSONALIZED_TIPS[profile.activity_level] || [];
      allTips.push(...activityTips.map(t => ({ ...t, category: 'activity', source: profile.activity_level })));
    }

    // Par restrictions alimentaires
    if (profile.dietary_restrictions) {
      try {
        const restrictions = JSON.parse(profile.dietary_restrictions);
        for (const restriction of restrictions) {
          const tips = PERSONALIZED_TIPS[restriction] || [];
          allTips.push(...tips.map(t => ({ ...t, category: 'diet', source: restriction })));
        }
      } catch {}
    }
  }

  // Filtrer les conseils déjà vus récemment
  allTips = allTips.filter(t => !recentTips.includes(t.id));

  // Mélanger et limiter
  allTips = allTips.sort(() => Math.random() - 0.5).slice(0, limit);

  // Enregistrer les conseils montrés
  const insertTip = db.prepare('INSERT INTO personalized_tips (user_id, tip_id) VALUES (?, ?)');
  for (const tip of allTips) {
    try {
      insertTip.run(userId, tip.id);
    } catch {}
  }

  return allTips;
};

// Helper: Mettre à jour les stats après un scan
export const updateStatsAfterScan = (userId, scoreGlobal, platName) => {
  const today = new Date().toISOString().split('T')[0];

  // Mettre à jour ou créer le log journalier
  const existingLog = db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?').get(userId, today);

  if (existingLog) {
    const newMealsCount = existingLog.meals_scanned + 1;
    const newTotalScore = existingLog.total_score + scoreGlobal;
    const newAvgScore = newTotalScore / newMealsCount;
    
    let bestMeal = existingLog.best_meal;
    let worstMeal = existingLog.worst_meal;
    
    // Parser pour comparer les scores
    try {
      const bestData = bestMeal ? JSON.parse(bestMeal) : null;
      const worstData = worstMeal ? JSON.parse(worstMeal) : null;
      
      if (!bestData || scoreGlobal > bestData.score) {
        bestMeal = JSON.stringify({ name: platName, score: scoreGlobal });
      }
      if (!worstData || scoreGlobal < worstData.score) {
        worstMeal = JSON.stringify({ name: platName, score: scoreGlobal });
      }
    } catch {
      bestMeal = JSON.stringify({ name: platName, score: scoreGlobal });
      worstMeal = JSON.stringify({ name: platName, score: scoreGlobal });
    }

    db.prepare(`
      UPDATE daily_logs 
      SET meals_scanned = ?, avg_score = ?, total_score = ?, best_meal = ?, worst_meal = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND log_date = ?
    `).run(newMealsCount, newAvgScore, newTotalScore, bestMeal, worstMeal, userId, today);
  } else {
    db.prepare(`
      INSERT INTO daily_logs (user_id, log_date, meals_scanned, avg_score, total_score, best_meal, worst_meal)
      VALUES (?, ?, 1, ?, ?, ?, ?)
    `).run(
      userId, 
      today, 
      scoreGlobal, 
      scoreGlobal,
      JSON.stringify({ name: platName, score: scoreGlobal }),
      JSON.stringify({ name: platName, score: scoreGlobal })
    );
  }

  // Mettre à jour les streaks
  const existingStreak = db.prepare('SELECT * FROM user_streaks WHERE user_id = ?').get(userId);
  
  if (existingStreak) {
    const lastScanDate = existingStreak.last_scan_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let newStreak = existingStreak.current_streak;
    
    if (lastScanDate === today) {
      // Déjà scanné aujourd'hui, pas de changement de streak
    } else if (lastScanDate === yesterday) {
      // Continue la série
      newStreak += 1;
    } else if (lastScanDate !== today) {
      // Série interrompue, on recommence
      newStreak = 1;
    }

    const longestStreak = Math.max(existingStreak.longest_streak, newStreak);
    const totalGoodMeals = existingStreak.total_good_meals + (scoreGlobal >= 70 ? 1 : 0);

    db.prepare(`
      UPDATE user_streaks 
      SET current_streak = ?, longest_streak = ?, total_scans = total_scans + 1, 
          total_good_meals = ?, last_scan_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(newStreak, longestStreak, totalGoodMeals, today, userId);
  } else {
    db.prepare(`
      INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_scans, total_good_meals, last_scan_date)
      VALUES (?, 1, 1, 1, ?, ?)
    `).run(userId, scoreGlobal >= 70 ? 1 : 0, today);
  }
};

// GET /api/stats/dashboard - Stats globales pour le dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    // Streaks et totaux
    let streaks = db.prepare('SELECT * FROM user_streaks WHERE user_id = ?').get(userId);
    if (!streaks) {
      streaks = { current_streak: 0, longest_streak: 0, total_scans: 0, total_good_meals: 0 };
    }

    // Stats d'aujourd'hui
    const todayLog = db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?').get(userId, today);

    // Stats de la semaine
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStats = db.prepare(`
      SELECT 
        COUNT(*) as days_active,
        SUM(meals_scanned) as total_meals,
        AVG(avg_score) as avg_score,
        SUM(total_score) as total_score
      FROM daily_logs 
      WHERE user_id = ? AND log_date >= ?
    `).get(userId, weekStart.toISOString().split('T')[0]);

    // Stats du mois
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStats = db.prepare(`
      SELECT 
        COUNT(*) as days_active,
        SUM(meals_scanned) as total_meals,
        AVG(avg_score) as avg_score
      FROM daily_logs 
      WHERE user_id = ? AND log_date >= ?
    `).get(userId, monthStart.toISOString().split('T')[0]);

    // Historique des 7 derniers jours pour le graphique
    const last7Days = db.prepare(`
      SELECT log_date, meals_scanned, avg_score 
      FROM daily_logs 
      WHERE user_id = ? AND log_date >= date('now', '-7 days')
      ORDER BY log_date ASC
    `).all(userId);

    // Conseils personnalisés
    const tips = getPersonalizedTips(userId, 3);

    res.json({
      streaks: {
        current: streaks.current_streak,
        longest: streaks.longest_streak,
        totalScans: streaks.total_scans,
        totalGoodMeals: streaks.total_good_meals,
        goodMealRate: streaks.total_scans > 0 
          ? Math.round((streaks.total_good_meals / streaks.total_scans) * 100) 
          : 0
      },
      today: todayLog ? {
        mealsScanned: todayLog.meals_scanned,
        avgScore: Math.round(todayLog.avg_score),
        bestMeal: todayLog.best_meal ? JSON.parse(todayLog.best_meal) : null,
        worstMeal: todayLog.worst_meal ? JSON.parse(todayLog.worst_meal) : null
      } : null,
      week: {
        daysActive: weekStats.days_active || 0,
        totalMeals: weekStats.total_meals || 0,
        avgScore: weekStats.avg_score ? Math.round(weekStats.avg_score) : 0
      },
      month: {
        daysActive: monthStats.days_active || 0,
        totalMeals: monthStats.total_meals || 0,
        avgScore: monthStats.avg_score ? Math.round(monthStats.avg_score) : 0
      },
      history: last7Days.map(d => ({
        date: d.log_date,
        meals: d.meals_scanned,
        score: Math.round(d.avg_score)
      })),
      tips
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/stats/history - Historique détaillé par période
router.get('/history', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const { period = 'week' } = req.query; // week, month, year

    let dateFilter;
    switch (period) {
      case 'month':
        dateFilter = "date('now', '-1 month')";
        break;
      case 'year':
        dateFilter = "date('now', '-1 year')";
        break;
      default:
        dateFilter = "date('now', '-7 days')";
    }

    const logs = db.prepare(`
      SELECT * FROM daily_logs 
      WHERE user_id = ? AND log_date >= ${dateFilter}
      ORDER BY log_date DESC
    `).all(userId);

    const analyses = db.prepare(`
      SELECT id, plat, score_global, created_at 
      FROM analysis_history 
      WHERE user_id = ? AND created_at >= ${dateFilter}
      ORDER BY created_at DESC
      LIMIT 50
    `).all(userId);

    // Calculer les moyennes
    const totalMeals = logs.reduce((sum, l) => sum + l.meals_scanned, 0);
    const avgScore = logs.length > 0 
      ? Math.round(logs.reduce((sum, l) => sum + l.avg_score, 0) / logs.length)
      : 0;

    res.json({
      period,
      summary: {
        daysActive: logs.length,
        totalMeals,
        avgScore
      },
      dailyLogs: logs.map(l => ({
        date: l.log_date,
        mealsScanned: l.meals_scanned,
        avgScore: Math.round(l.avg_score),
        bestMeal: l.best_meal ? JSON.parse(l.best_meal) : null,
        worstMeal: l.worst_meal ? JSON.parse(l.worst_meal) : null
      })),
      recentAnalyses: analyses.map(a => ({
        id: a.id,
        plat: a.plat,
        score: a.score_global,
        date: a.created_at
      }))
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/stats/tips - Obtenir de nouveaux conseils
router.get('/tips', authMiddleware, (req, res) => {
  try {
    const tips = getPersonalizedTips(req.userId, 5);
    res.json({ tips });
  } catch (error) {
    console.error('Tips error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
