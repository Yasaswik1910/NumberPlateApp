const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'plates.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening DB', err);
  else console.log('SQLite DB connected.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS detected_vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate_number TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS theft_vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate_number TEXT UNIQUE
  )`);
});

module.exports = db;
