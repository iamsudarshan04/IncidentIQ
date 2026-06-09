const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../incidentiq.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS Incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        developer_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        timeline_text TEXT,
        logs_text TEXT,
        git_diff_text TEXT,
        voice_transcript TEXT,
        ocr_text TEXT,
        FOREIGN KEY(developer_id) REFERENCES Users(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS RCAReports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id INTEGER,
        developer_id INTEGER,
        executive_summary TEXT,
        root_cause TEXT,
        markdown_report TEXT,
        confidence_score INTEGER,
        severity_level TEXT,
        recommendations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'Generated',
        submit_name TEXT,
        submit_email TEXT,
        submit_team TEXT,
        submit_notes TEXT,
        submitted_at DATETIME,
        manager_comment TEXT,
        manager_name TEXT,
        reviewed_at DATETIME,
        notified BOOLEAN DEFAULT 0,
        FOREIGN KEY(incident_id) REFERENCES Incidents(id),
        FOREIGN KEY(developer_id) REFERENCES Users(id)
      )`, (err) => {
        if (!err) {
          // Attempt to add new columns if the table already existed
          const columnsToAdd = [
            "markdown_report TEXT",
            "status TEXT DEFAULT 'Generated'",
            "submit_name TEXT",
            "submit_email TEXT",
            "submit_team TEXT",
            "submit_notes TEXT",
            "submitted_at DATETIME",
            "manager_comment TEXT",
            "manager_name TEXT",
            "reviewed_at DATETIME",
            "notified BOOLEAN DEFAULT 0"
          ];
          columnsToAdd.forEach(col => {
            db.run(`ALTER TABLE RCAReports ADD COLUMN ${col}`, () => {});
          });
        }
      });
      
      db.run(`CREATE TABLE IF NOT EXISTS ChatHistory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT,
        sender TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES Users(id)
      )`);
    });
  }
});

module.exports = db;
