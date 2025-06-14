const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const db = new sqlite3.Database("ruinox_escape2.db", (err) => {
  // Error handling
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database");
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL,
	age TEXT NOT NULL,
        score INTEGER DEFAULT 0
      )`
    );
  }
});

module.exports = db;