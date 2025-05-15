const sqlite3 = require('sqlite3').verbose();

class SQLiteService {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(`Could not connect to database: ${err.message}`);
            } else {
                console.log('Connected to the SQLite database.');
                this.initialize();
            }
        });
    }

    initialize() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT
            )
        `, (err) => {
            if (err) {
                console.error(`Error creating table: ${err.message}`);
            } else {
                console.log('Users table created or already exists.');
            }
        });
    }

    register(username, password, name, callback) {
        this.db.run(`INSERT INTO users (username, password, name) VALUES (?, ?, ?)`, [username, password, name], function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, this.lastID);
            }
        });
    }

    login(username, password, callback) {
        this.db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
            if (err) {
                callback(err);
            } else if (row) {
                callback(null, row);
            } else {
                callback(new Error('Invalid username or password'));
            }
        });
    }

    changePassword(userId, newPassword, callback) {
        this.db.run(`UPDATE users SET password = ? WHERE id = ?`, [newPassword, userId], function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, this.changes);
            }
        });
    }

    logout(userId, callback) {
        // In a real-world scenario, you might want to invalidate a session token here.
        // For simplicity, we'll just call the callback with no action.
        callback(null, true);
    }

    getUserInfo(userId, callback) {
        this.db.get(`SELECT id, username, name FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) {
                callback(err);
            } else {
                callback(null, row);
            }
        });
    }

    changeName(userId, newName, callback) {
        this.db.run(`UPDATE users SET name = ? WHERE id = ?`, [newName, userId], function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, this.changes);
            }
        });
    }

    close() {
        this.db.close((err) => {
            if (err) {
                console.error(`Error closing the database: ${err.message}`);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

module.exports = SQLiteService;