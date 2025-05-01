const sqlite3 = require("sqlite3").verbose(); // Verbose used for more detailed logs
require("dotenv").config();

const dbFile = process.env.DATABASE_FILE || "ruinox_escape.db";

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database: ${dbFile}");
    // Use serialize to ensure table creation happens sequentially
    db.serialize(() => {
      // Create users table to stores login information
      db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                hashed_password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
        if (err) console.error("Error creating users table:", err.message);
        else console.log("Users table checked/created.");
      });
      // Create game data table to store game, account/profile, settings, and user stats info.
      db.run(`CREATE TABLE IF NOT EXISTS game_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                has_active_game INTEGER DEFAULT 0,
                current_scene_index INTEGER DEFAULT 1,
                player_position_x REAL DEFAULT 0,
                player_position_y REAL DEFAULT 0,
                current_timer REAL DEFAULT 120,
                current_oxygen_level INTEGER DEFAULT 100,
                minigames_status TEXT DEFAULT '[0,0,0]',
                dash_charges INTEGER DEFAULT 0,
                difficulty_level INTEGER DEFAULT 1,
                best_time REAL DEFAULT NULL,
                high_score INTEGER DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`, (err) => {
        if (err) console.error("Error creating game_data table:", err.message);
        // else console.log("Game data table created.");
      });
    });
  }
});

module.exports = db;