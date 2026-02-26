import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base de données SQLite dans le dossier backend
const dbPath = path.join(__dirname, '..', 'optivie.db');
const db = new Database(dbPath);

// Activer les foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialiser les tables au démarrage
const initTables = () => {
  // Table users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table sessions (pour la gestion des sessions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table health_goals
  db.exec(`
    CREATE TABLE IF NOT EXISTS health_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_type TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table user_profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      age INTEGER,
      gender TEXT,
      weight REAL,
      height REAL,
      activity_level TEXT,
      dietary_restrictions TEXT,
      allergies TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table analysis_history
  db.exec(`
    CREATE TABLE IF NOT EXISTS analysis_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plat TEXT NOT NULL,
      score_global INTEGER,
      ingredients TEXT,
      analysis_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table daily_logs - Suivi journalier
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      log_date DATE NOT NULL,
      meals_scanned INTEGER DEFAULT 0,
      avg_score REAL DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      best_meal TEXT,
      worst_meal TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, log_date)
    )
  `);

  // Table user_streaks - Séries et achievements
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      total_scans INTEGER DEFAULT 0,
      total_good_meals INTEGER DEFAULT 0,
      last_scan_date DATE,
      weekly_goal INTEGER DEFAULT 7,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table personalized_tips - Conseils personnalisés vus
  db.exec(`
    CREATE TABLE IF NOT EXISTS personalized_tips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tip_id TEXT NOT NULL,
      shown_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      dismissed INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('SQLite database initialized');
};

// Initialiser les tables
initTables();

export default db;
