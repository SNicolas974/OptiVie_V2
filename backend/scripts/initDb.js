import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'optivie.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const initDb = () => {
  try {
    console.log('Initializing SQLite database...');

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
    console.log('Users table created');

    // Table sessions
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
    console.log('Sessions table created');

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
    console.log('Health goals table created');

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
    console.log('User profiles table created');

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
    console.log('Analysis history table created');

    console.log('\nHealth goal types available:');
    console.log('- weight_loss (Perte de poids)');
    console.log('- mental_health (Sante mentale)');
    console.log('- painful_periods (Regles douloureuses)');
    console.log('- joint_pain (Douleurs articulaires)');
    console.log('- digestive_health (Sante digestive)');
    console.log('- skin_health (Sante de la peau)');
    console.log('- energy_boost (Boost energie)');
    console.log('- anti_aging (Anti-age)');
    console.log('- immune_boost (Renforcer immunite)');
    console.log('- heart_health (Sante cardiaque)');

    console.log('\nSQLite database initialized successfully!');
    console.log('Database file:', dbPath);

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    db.close();
  }
};

initDb();
