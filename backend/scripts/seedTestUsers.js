import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'optivie.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Helper pour générer des dates passées
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const seedTestUsers = async () => {
  console.log('Seeding test users Toto and Titi...\n');

  // Hash du mot de passe (password123 pour les deux)
  const passwordHash = await bcrypt.hash('password123', 10);

  // ========================================
  // TOTO - Homme, veut perdre du poids, sédentaire
  // ========================================
  console.log('Creating Toto...');
  
  // Supprimer si existe déjà
  const existingToto = db.prepare('SELECT id FROM users WHERE email = ?').get('toto@test.com');
  if (existingToto) {
    db.prepare('DELETE FROM users WHERE id = ?').run(existingToto.id);
    console.log('  - Deleted existing Toto');
  }

  // Créer l'utilisateur Toto
  const totoResult = db.prepare(`
    INSERT INTO users (email, password, name, created_at) 
    VALUES (?, ?, ?, ?)
  `).run('toto@test.com', passwordHash, 'Toto', daysAgo(30));
  
  const totoId = totoResult.lastInsertRowid;
  console.log(`  - User created with ID: ${totoId}`);

  // Profil de Toto - homme, 35 ans, 92kg, sédentaire
  db.prepare(`
    INSERT INTO user_profiles (user_id, age, gender, weight, height, activity_level, dietary_restrictions, allergies)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(totoId, 35, 'homme', 92, 178, 'sedentaire', '[]', '[]');
  console.log('  - Profile created: 35 ans, 92kg, 178cm, sédentaire');

  // Objectif de Toto - perdre du poids
  db.prepare(`
    INSERT INTO health_goals (user_id, goal_type, is_active)
    VALUES (?, ?, 1)
  `).run(totoId, 'weight_loss');
  console.log('  - Health goal: weight_loss');

  // Session pour Toto
  const totoToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `).run(totoId, totoToken, expiresAt);
  console.log(`  - Session token: ${totoToken.substring(0, 20)}...`);

  // Streak de Toto
  db.prepare(`
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_scans, total_good_meals, last_scan_date, weekly_goal)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(totoId, 3, 7, 25, 12, daysAgo(0), 5);
  console.log('  - Streak: 3 jours en cours, record 7 jours, 25 scans total');

  // Historique d'analyses de Toto (plats typiques d'un régime pas toujours équilibré)
  const totoMeals = [
    {
      plat: 'Big Mac Menu',
      score: 35,
      date: daysAgo(0),
      ingredients: ['pain', 'boeuf', 'fromage', 'sauce', 'cornichons', 'oignons', 'frites', 'coca'],
      analysis: {
        score_global: 35,
        verdict: 'Ce repas est très calorique et ne vous aidera pas dans votre objectif de perte de poids.',
        points_positifs: ['Apport en protéines'],
        points_negatifs: ['Très calorique', 'Riche en graisses saturées', 'Sucres ajoutés dans la boisson'],
        recommandations: ['Préférez un repas fait maison', 'Évitez les sodas', 'Limitez les fritures']
      }
    },
    {
      plat: 'Salade César',
      score: 72,
      date: daysAgo(1),
      ingredients: ['laitue', 'poulet grillé', 'parmesan', 'croûtons', 'sauce césar'],
      analysis: {
        score_global: 72,
        verdict: 'Un bon choix ! La salade est adaptée à votre objectif de perte de poids.',
        points_positifs: ['Riche en fibres', 'Protéines maigres', 'Faible en calories'],
        points_negatifs: ['Sauce riche en lipides', 'Croûtons ajoutent des glucides'],
        recommandations: ['Demandez la sauce à part', 'Évitez les croûtons']
      }
    },
    {
      plat: 'Pizza 4 Fromages',
      score: 42,
      date: daysAgo(2),
      ingredients: ['pâte', 'mozzarella', 'gorgonzola', 'parmesan', 'chèvre', 'sauce tomate'],
      analysis: {
        score_global: 42,
        verdict: 'Trop calorique pour un objectif de perte de poids.',
        points_positifs: ['Calcium', 'Apport en protéines'],
        points_negatifs: ['Très riche en graisses saturées', 'Glucides raffinés'],
        recommandations: ['Limitez-vous à 2 parts', 'Accompagnez d\'une salade verte']
      }
    },
    {
      plat: 'Poulet grillé avec légumes vapeur',
      score: 88,
      date: daysAgo(3),
      ingredients: ['poulet', 'brocoli', 'carottes', 'haricots verts', 'huile d\'olive'],
      analysis: {
        score_global: 88,
        verdict: 'Excellent choix ! Parfait pour votre objectif de perte de poids.',
        points_positifs: ['Protéines maigres', 'Riche en fibres', 'Faible en calories', 'Vitamines'],
        points_negatifs: [],
        recommandations: ['Continuez ainsi !']
      }
    },
    {
      plat: 'Kebab frites',
      score: 38,
      date: daysAgo(5),
      ingredients: ['viande kebab', 'pain pita', 'salade', 'tomates', 'oignons', 'sauce blanche', 'frites'],
      analysis: {
        score_global: 38,
        verdict: 'Repas trop calorique et gras pour votre objectif.',
        points_positifs: ['Quelques légumes'],
        points_negatifs: ['Très calorique', 'Sauce grasse', 'Fritures'],
        recommandations: ['Prenez sans frites', 'Demandez moins de sauce']
      }
    }
  ];

  for (const meal of totoMeals) {
    db.prepare(`
      INSERT INTO analysis_history (user_id, plat, score_global, ingredients, analysis_data, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      totoId, 
      meal.plat, 
      meal.score, 
      JSON.stringify(meal.ingredients),
      JSON.stringify(meal.analysis),
      meal.date + ' 12:30:00'
    );
  }
  console.log(`  - ${totoMeals.length} meal analyses added`);

  // Daily logs pour Toto
  const totoDailyLogs = [
    { date: daysAgo(0), meals: 1, avgScore: 35, total: 35, best: { name: 'Big Mac Menu', score: 35 }, worst: { name: 'Big Mac Menu', score: 35 } },
    { date: daysAgo(1), meals: 1, avgScore: 72, total: 72, best: { name: 'Salade César', score: 72 }, worst: { name: 'Salade César', score: 72 } },
    { date: daysAgo(2), meals: 1, avgScore: 42, total: 42, best: { name: 'Pizza 4 Fromages', score: 42 }, worst: { name: 'Pizza 4 Fromages', score: 42 } },
    { date: daysAgo(3), meals: 1, avgScore: 88, total: 88, best: { name: 'Poulet grillé avec légumes vapeur', score: 88 }, worst: { name: 'Poulet grillé avec légumes vapeur', score: 88 } },
  ];

  for (const log of totoDailyLogs) {
    db.prepare(`
      INSERT INTO daily_logs (user_id, log_date, meals_scanned, avg_score, total_score, best_meal, worst_meal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(totoId, log.date, log.meals, log.avgScore, log.total, JSON.stringify(log.best), JSON.stringify(log.worst));
  }
  console.log(`  - ${totoDailyLogs.length} daily logs added`);

  // ========================================
  // TITI - Femme, règles douloureuses
  // ========================================
  console.log('\nCreating Titi...');
  
  // Supprimer si existe déjà
  const existingTiti = db.prepare('SELECT id FROM users WHERE email = ?').get('titi@test.com');
  if (existingTiti) {
    db.prepare('DELETE FROM users WHERE id = ?').run(existingTiti.id);
    console.log('  - Deleted existing Titi');
  }

  // Créer l'utilisateur Titi
  const titiResult = db.prepare(`
    INSERT INTO users (email, password, name, created_at) 
    VALUES (?, ?, ?, ?)
  `).run('titi@test.com', passwordHash, 'Titi', daysAgo(45));
  
  const titiId = titiResult.lastInsertRowid;
  console.log(`  - User created with ID: ${titiId}`);

  // Profil de Titi - femme, 28 ans, 58kg, active
  db.prepare(`
    INSERT INTO user_profiles (user_id, age, gender, weight, height, activity_level, dietary_restrictions, allergies)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(titiId, 28, 'femme', 58, 165, 'actif', '[]', JSON.stringify(['lactose']));
  console.log('  - Profile created: 28 ans, 58kg, 165cm, active, intolérante au lactose');

  // Objectif de Titi - règles douloureuses
  db.prepare(`
    INSERT INTO health_goals (user_id, goal_type, is_active)
    VALUES (?, ?, 1)
  `).run(titiId, 'painful_periods');
  console.log('  - Health goal: painful_periods');

  // Session pour Titi
  const titiToken = crypto.randomBytes(32).toString('hex');
  db.prepare(`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `).run(titiId, titiToken, expiresAt);
  console.log(`  - Session token: ${titiToken.substring(0, 20)}...`);

  // Streak de Titi : 45 scans total, 38 bons repas (données cohérentes avec l'historique ci-dessous)
  db.prepare(`
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_scans, total_good_meals, last_scan_date, weekly_goal)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(titiId, 12, 15, 45, 38, daysAgo(0), 7);
  console.log('  - Streak: 12 jours en cours, record 15 jours, 45 scans total, 38 bons repas');

  // Historique d'analyses de Titi (plats adaptés/non adaptés aux règles douloureuses)
  const titiMeals = [
    {
      plat: 'Saumon grillé aux épinards',
      score: 92,
      date: daysAgo(0),
      ingredients: ['saumon', 'épinards', 'citron', 'huile d\'olive', 'ail'],
      analysis: {
        score_global: 92,
        verdict: 'Excellent choix pour soulager les règles douloureuses !',
        points_positifs: ['Oméga-3 anti-inflammatoires', 'Fer des épinards', 'Magnésium'],
        points_negatifs: [],
        recommandations: ['Continuez à privilégier les poissons gras !']
      }
    },
    {
      plat: 'Chocolat noir 70% et banane',
      score: 85,
      date: daysAgo(0),
      ingredients: ['chocolat noir', 'banane'],
      analysis: {
        score_global: 85,
        verdict: 'Très bon choix de snack pour cette période !',
        points_positifs: ['Magnésium du chocolat', 'Potassium de la banane', 'Antioxydants'],
        points_negatifs: ['Modérer la quantité de chocolat'],
        recommandations: ['2-3 carrés suffisent pour bénéficier des bienfaits']
      }
    },
    {
      plat: 'Soupe de lentilles au curcuma',
      score: 95,
      date: daysAgo(1),
      ingredients: ['lentilles', 'curcuma', 'gingembre', 'carottes', 'oignons', 'bouillon'],
      analysis: {
        score_global: 95,
        verdict: 'Parfait ! Les propriétés anti-inflammatoires du curcuma et gingembre sont idéales.',
        points_positifs: ['Anti-inflammatoire naturel', 'Riche en fer', 'Fibres', 'Réchauffant'],
        points_negatifs: [],
        recommandations: ['Ajoutez un peu de poivre noir pour mieux absorber le curcuma']
      }
    },
    {
      plat: 'Pizza jambon fromage',
      score: 45,
      date: daysAgo(2),
      ingredients: ['pâte', 'sauce tomate', 'jambon', 'mozzarella', 'gruyère'],
      analysis: {
        score_global: 45,
        verdict: 'Attention : les produits laitiers peuvent aggraver l\'inflammation.',
        points_positifs: ['Quelques protéines'],
        points_negatifs: ['Produits laitiers inflammatoires', 'Graisses saturées', 'Attention à votre intolérance au lactose !'],
        recommandations: ['Préférez une pizza végétarienne sans fromage', 'Ou avec du fromage végétal']
      }
    },
    {
      plat: 'Avocat toast aux graines',
      score: 88,
      date: daysAgo(3),
      ingredients: ['pain complet', 'avocat', 'graines de chia', 'graines de lin', 'citron'],
      analysis: {
        score_global: 88,
        verdict: 'Excellent petit-déjeuner anti-inflammatoire !',
        points_positifs: ['Oméga-3 des graines', 'Bon gras de l\'avocat', 'Fibres du pain complet'],
        points_negatifs: [],
        recommandations: ['Vous pouvez ajouter un œuf pour plus de protéines']
      }
    },
    {
      plat: 'Café au lait et croissant',
      score: 32,
      date: daysAgo(4),
      ingredients: ['café', 'lait', 'croissant', 'beurre'],
      analysis: {
        score_global: 32,
        verdict: 'Petit-déjeuner à éviter pendant les règles.',
        points_positifs: [],
        points_negatifs: ['Caféine aggrave les crampes', 'Lait inflammatoire', 'Sucres rapides', 'Graisses saturées du croissant'],
        recommandations: ['Essayez un thé au gingembre', 'Remplacez par un petit-déjeuner aux fruits et graines']
      }
    },
    {
      plat: 'Buddha bowl quinoa et légumes',
      score: 91,
      date: daysAgo(5),
      ingredients: ['quinoa', 'pois chiches', 'avocat', 'chou kale', 'carottes', 'tahini'],
      analysis: {
        score_global: 91,
        verdict: 'Super choix ! Riche en nutriments essentiels pour cette période.',
        points_positifs: ['Fer', 'Magnésium', 'Fibres', 'Protéines végétales'],
        points_negatifs: [],
        recommandations: ['Parfait, continuez ainsi !']
      }
    },
    {
      plat: 'Tisane gingembre menthe et dattes',
      score: 94,
      date: daysAgo(6),
      ingredients: ['gingembre frais', 'menthe', 'dattes', 'eau chaude'],
      analysis: {
        score_global: 94,
        verdict: 'Parfait pour soulager les crampes naturellement !',
        points_positifs: ['Gingembre anti-crampes', 'Menthe apaisante', 'Sucre naturel des dattes', 'Hydratation'],
        points_negatifs: [],
        recommandations: ['Buvez-en plusieurs tasses par jour pendant les règles']
      }
    }
  ];

  for (const meal of titiMeals) {
    db.prepare(`
      INSERT INTO analysis_history (user_id, plat, score_global, ingredients, analysis_data, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      titiId,
      meal.plat,
      meal.score,
      JSON.stringify(meal.ingredients),
      JSON.stringify(meal.analysis),
      meal.date + ' 12:30:00'
    );
  }

  // Ajouter 37 repas de plus pour atteindre 45 scans total (cohérent avec user_streaks.total_scans)
  const titiExtraPlats = [
    { plat: 'Soupe de lentilles au curcuma', score: 95 },
    { plat: 'Saumon grillé aux épinards', score: 92 },
    { plat: 'Buddha bowl quinoa et légumes', score: 91 },
    { plat: 'Tisane gingembre menthe et dattes', score: 94 },
    { plat: 'Avocat toast aux graines', score: 88 },
    { plat: 'Chocolat noir 70% et banane', score: 85 },
    { plat: 'Pizza jambon fromage', score: 45 },
    { plat: 'Café au lait et croissant', score: 32 },
  ];
  const insertTitiAnalysis = db.prepare(`
    INSERT INTO analysis_history (user_id, plat, score_global, ingredients, analysis_data, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (let i = 0; i < 37; i++) {
    const ref = titiExtraPlats[i % titiExtraPlats.length];
    const day = daysAgo(7 + i);
    insertTitiAnalysis.run(
      titiId,
      ref.plat,
      ref.score,
      JSON.stringify(['exemple']),
      JSON.stringify({ score_global: ref.score, verdict: 'Analyse', points_positifs: [], points_negatifs: [], recommandations: [] }),
      day + ' 12:30:00'
    );
  }
  console.log(`  - ${titiMeals.length + 37} meal analyses added (45 total)`);

  // Daily logs pour Titi : 7 derniers jours détaillés + 37 jours avec 1 repas = 45 repas au total
  const titiDailyLogs = [
    { date: daysAgo(0), meals: 2, avgScore: 88.5, total: 177, best: { name: 'Saumon grillé aux épinards', score: 92 }, worst: { name: 'Chocolat noir 70% et banane', score: 85 } },
    { date: daysAgo(1), meals: 1, avgScore: 95, total: 95, best: { name: 'Soupe de lentilles au curcuma', score: 95 }, worst: { name: 'Soupe de lentilles au curcuma', score: 95 } },
    { date: daysAgo(2), meals: 1, avgScore: 45, total: 45, best: { name: 'Pizza jambon fromage', score: 45 }, worst: { name: 'Pizza jambon fromage', score: 45 } },
    { date: daysAgo(3), meals: 1, avgScore: 88, total: 88, best: { name: 'Avocat toast aux graines', score: 88 }, worst: { name: 'Avocat toast aux graines', score: 88 } },
    { date: daysAgo(4), meals: 1, avgScore: 32, total: 32, best: { name: 'Café au lait et croissant', score: 32 }, worst: { name: 'Café au lait et croissant', score: 32 } },
    { date: daysAgo(5), meals: 1, avgScore: 91, total: 91, best: { name: 'Buddha bowl quinoa et légumes', score: 91 }, worst: { name: 'Buddha bowl quinoa et légumes', score: 91 } },
    { date: daysAgo(6), meals: 1, avgScore: 94, total: 94, best: { name: 'Tisane gingembre menthe et dattes', score: 94 }, worst: { name: 'Tisane gingembre menthe et dattes', score: 94 } },
  ];
  for (const log of titiDailyLogs) {
    db.prepare(`
      INSERT INTO daily_logs (user_id, log_date, meals_scanned, avg_score, total_score, best_meal, worst_meal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(titiId, log.date, log.meals, log.avgScore, log.total, JSON.stringify(log.best), JSON.stringify(log.worst));
  }
  for (let i = 0; i < 37; i++) {
    const day = daysAgo(7 + i);
    const ref = titiExtraPlats[i % titiExtraPlats.length];
    db.prepare(`
      INSERT INTO daily_logs (user_id, log_date, meals_scanned, avg_score, total_score, best_meal, worst_meal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(titiId, day, 1, ref.score, ref.score, JSON.stringify({ name: ref.plat, score: ref.score }), JSON.stringify({ name: ref.plat, score: ref.score }));
  }
  console.log('  - 44 daily logs added (7 derniers jours détaillés + 37 jours, 45 repas total)');

  // ========================================
  // Résumé
  // ========================================
  console.log('\n========================================');
  console.log('SEED COMPLETED SUCCESSFULLY!');
  console.log('========================================\n');
  
  console.log('TOTO (veut perdre du poids, sédentaire):');
  console.log('  Email: toto@test.com');
  console.log('  Password: password123');
  console.log('  Token: ' + totoToken);
  console.log('');
  
  console.log('TITI (règles douloureuses, intolérante lactose):');
  console.log('  Email: titi@test.com');
  console.log('  Password: password123');
  console.log('  Token: ' + titiToken);
  console.log('');

  db.close();
};

seedTestUsers().catch(console.error);
