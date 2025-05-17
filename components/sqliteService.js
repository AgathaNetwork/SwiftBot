const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
        // 创建 users 表
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

        // 新增 sessions 表
        this.db.run(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                user_id INTEGER NOT NULL,
                login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                logout_time DATETIME,
                is_logged_out BOOLEAN DEFAULT FALSE,
                login_ip TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `, (err) => {
            if (err) {
                console.error(`Error creating table: ${err.message}`);
            } else {
                console.log('Sessions table created or already exists.');
            }
        });

        // 新增 keys 表
        this.db.run(`
            CREATE TABLE IF NOT EXISTS keys (
                key TEXT PRIMARY KEY,
                time DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error(`Error creating table: ${err.message}`);
            } else {
                console.log('Keys table created or already exists.');
            }
        });
    }

    // 新增方法：创建 key
    createKey(sessionId, callback) {
        const key = crypto.randomBytes(10).toString('hex').toLowerCase(); // 生成 20 位小写英文字母和数字的组合
        this.db.run(`INSERT INTO keys (key) VALUES (?)`, [key], function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, { key, time: new Date().toISOString() });
            }
        });
    }

    // 新增方法：删除 key
    deleteKey(key, callback) {
        this.db.run(`DELETE FROM keys WHERE key = ?`, [key], function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, { success: true });
            }
        });
    }

    // 新增方法：列出 key 列表
    listKeys(sessionId, callback) {
        this.db.all(`SELECT key, time FROM keys`, [], (err, rows) => {
            if (err) {
                callback(err);
            } else {
                callback(null, rows);
            }
        });
    }

    async register(username, password, name, callback) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            this.db.run(`INSERT INTO users (username, password, name) VALUES (?, ?, ?)`, [username, hashedPassword, name], function(err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, this.lastID);
                }
            });
        } catch (err) {
            callback(err);
        }
    }

    async login(username, password, ip, callback) {
        this.db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
            if (err) {
                callback(err);
            } else if (row) {
                try {
                    const match = await bcrypt.compare(password, row.password);
                    if (match) {
                        // 生成 session_id
                        const sessionId = crypto.randomBytes(16).toString('hex');
                        // 插入 session 记录
                        this.db.run(`INSERT INTO sessions (session_id, user_id, login_ip) VALUES (?, ?, ?)`, [sessionId, row.id, ip], function(err) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, { sessionId, userId: row.id });
                            }
                        });
                    } else {
                        callback(new Error('Invalid username or password'));
                    }
                } catch (err) {
                    callback(err);
                }
            } else {
                callback(new Error('Invalid username or password'));
            }
        });
    }

    async logout(sessionId, callback) {
        this.db.run(`UPDATE sessions SET logout_time = CURRENT_TIMESTAMP, is_logged_out = TRUE WHERE session_id = ?`, [sessionId], function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, { success: true });
            }
        });
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

    // 新增方法：初始化用户
    initializeUser(username, name, password, callback) {
        this.isUserInitialized((err, isInitialized) => {
            if (err) {
                callback(err);
            } else if (isInitialized) {
                callback(new Error('User initialization already completed'));
            } else {
                this.register(username, password, name, (err, userId) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, { success: true, userId });
                    }
                });
            }
        });
    }

    // 新增方法：判断用户表中是否有数据
    isUserInitialized(callback) {
        this.db.get(`SELECT COUNT(*) as count FROM users`, [], (err, row) => {
            if (err) {
                callback(err);
            } else {
                callback(null, row.count > 0);
            }
        });
    }

    // 新增方法：获取用户会话信息
    getUserSession(sessionId, callback) {
        this.db.get(`SELECT * FROM sessions WHERE session_id = ? AND is_logged_out = FALSE`, [sessionId], (err, row) => {
            if (err) {
                callback(err);
            } else {
                callback(null, row);
            }
        });
    }

    // 新增方法：通过 sessionId 获取用户信息
    getUserInfoBySession(sessionId, callback) {
        this.db.get(`
            SELECT users.id, users.username, users.name
            FROM users
            JOIN sessions ON users.id = sessions.user_id
            WHERE sessions.session_id = ? AND sessions.is_logged_out = FALSE
        `, [sessionId], (err, row) => {
            if (err) {
                callback(err);
            } else {
                callback(null, row);
            }
        });
    }
}

module.exports = SQLiteService;