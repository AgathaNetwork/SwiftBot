const express = require('express');
const router = express.Router();
const SQLiteService = require('../components/sqliteService');
const userService = new SQLiteService('db/runtime.db');
const botManager = require('../engine/botManager');
const crypto = require('crypto');

// 登录路由
router.post('/api/login', (req, res) => {
    const { username, password, ip } = req.body;
    userService.login(username, password, ip, (err, result) => {
        if (err) {
            res.status(401).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// 登出路由
router.post('/api/logout', (req, res) => {
    const { sessionId } = req.body;
    userService.logout(sessionId, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// 获取用户信息路由
router.get('/api/userinfo/:userId', (req, res) => {
    const { userId } = req.params;
    userService.getUserInfo(userId, (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(user);
        }
    });
});

// 新增路由：通过 sessionId 获取用户信息
router.get('/api/userinfo/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    userService.getUserInfoBySession(sessionId, (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!user) {
            res.status(404).json({ error: 'User not found or session is invalid.' });
        } else {
            res.json(user);
        }
    });
});

// 修改用户名路由
router.put('/api/changename', (req, res) => {
    const { userId, newName } = req.body;
    userService.changeName(userId, newName, (err, changes) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Name changed successfully', changes });
        }
    });
});

// 用户初始化路由
router.post('/api/initializeUser', (req, res) => {
    const { username, name, password } = req.body;

    // 验证用户名格式
    if (!/^[a-z0-9]+$/.test(username)) {
        return res.status(400).json({ error: 'Username must be lowercase letters and numbers only.' });
    }

    // 验证昵称格式
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        return res.status(400).json({ error: 'Nickname must be letters, numbers, and underscores only.' });
    }

    // 验证密码长度
    if (password.length < 8 || password.length > 20) {
        return res.status(400).json({ error: 'Password must be 8-20 characters long.' });
    }

    userService.initializeUser(username, name, password, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// 判断用户是否已初始化路由
router.get('/api/isUserInitialized', (req, res) => {
    userService.isUserInitialized((err, isInitialized) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ isInitialized });
        }
    });
});

// 新增路由：创建新的Bot
router.post('/api/createBot', (req, res) => {
    const { ip, port, version, username } = req.body;

    // 验证参数
    if (!ip || !port || !version || !username) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // 生成随机 UUID
        const uuid = crypto.randomUUID();
        const bot = botManager.createBot(ip, port, version, username, uuid);
        res.json({ message: 'Bot created successfully', bot: { username, ip, port, version, uuid } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 新增路由：获取所有Bot
router.get('/api/bots', (req, res) => {
    const bots = botManager.getAllBots().map(bot => ({
        username: bot.username,
        ip: bot.presetIp, // 确保返回 ip 字段，如果不存在则默认为 'Unknown'
        port: bot.presetPort, // 确保返回 port 字段，如果不存在则默认为 'Unknown'
        version: bot.version,
        uuid: bot.uuid // 返回 Bot 的 UUID
    }));
    res.json(bots);
});

// 新增路由：获取Bot的属性信息
router.get('/api/botProperties/:uuid', (req, res) => {
    const { uuid } = req.params;
    const botProperties = botManager.getBotProperties(uuid);

    if (!botProperties) {
        return res.status(404).json({ error: 'Bot not found' });
    }

    res.json(botProperties);
});

// 新增路由：获取Bot的聊天消息
router.get('/api/botChatMessages/:uuid', (req, res) => {
    const { uuid } = req.params;
    const chatMessages = botManager.getBotChatMessages(uuid);

    if (!chatMessages) {
        return res.status(404).json({ error: 'Bot not found or no chat messages available' });
    }

    // 返回的消息格式为 [{ content: '消息内容', timestamp: '时间戳' }]
    res.json(chatMessages);
});

// 新增路由：向指定Bot发送消息或指令
router.post('/api/sendMessage', (req, res) => {
    const { uuid, message } = req.body;

    if (!uuid || !message) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const bot = botManager.getBotByUuid(uuid);
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        // 调用BotManager的方法发送消息
        botManager.sendMessageToBot(uuid, message);
        res.json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 新增路由：重生指定的Bot
router.post('/api/respawnBot/:uuid', (req, res) => {
    const { uuid } = req.params;

    try {
        // 调用 BotManager 的 respawnBot 方法
        botManager.respawnBot(uuid);
        res.json({ message: 'Bot respawned successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 新增路由：删除指定的Bot
router.delete('/api/deleteBot/:uuid', (req, res) => {
    const { uuid } = req.params;

    try {
        const bot = botManager.getBotByUuid(uuid);
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        // 调用 BotManager 的 deleteBot 方法
        botManager.deleteBot(uuid);
        res.json({ message: 'Bot deleted successfully' });
    } catch (err) {
        console.error('Error deleting bot:', err);
        res.status(500).json({ error: err.message });
    }
});

// 新增路由：删除Bot
router.delete('/api/bots/:username', (req, res) => {
    const { username } = req.params;
    const bot = botManager.getBot(username);

    if (!bot) {
        return res.status(404).json({ error: 'Bot not found' });
    }

    bot.end();
    botManager.removeBot(username);
    res.json({ message: `Bot ${username} has been removed` });
});

// 新增路由：丢出背包
router.post('/api/dropInventory/:uuid', (req, res) => {
    const { uuid } = req.params;

    try {
        const bot = botManager.getBotByUuid(uuid);
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        // 调用 BotManager 的 dropInventory 方法
        botManager.dropInventory(uuid);
        res.json({ message: 'Inventory dropped successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 新增路由：右键操作
router.post('/api/rightClick/:uuid', (req, res) => {
    const { uuid } = req.params;

    try {
        const bot = botManager.getBotByUuid(uuid);
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        // 调用 BotManager 的 rightClick 方法
        botManager.rightClick(uuid);
        res.json({ message: 'Right click performed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 新增路由：获取视距内的实体数量
router.get('/api/entityCount/:uuid', (req, res) => {
    const { uuid } = req.params;
    const entityCount = botManager.getEntityCount(uuid);

    if (entityCount === null) {
        return res.status(404).json({ error: 'Bot not found' });
    }

    res.json({ entityCount });
});

// 新增路由：创建 key
router.post('/api/createKey', (req, res) => {
    const { sessionId } = req.body;
    userService.createKey(sessionId, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// 新增路由：删除 key
router.delete('/api/deleteKey/:key', (req, res) => {
    const { key } = req.params;
    userService.deleteKey(key, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

// 新增路由：列出 key 列表
router.get('/api/listKeys', (req, res) => {
    const { sessionId } = req.query;
    userService.listKeys(sessionId, (err, keys) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(keys);
        }
    });
});

// 新增路由：通过 key 创建 bot
router.post('/key/createBot/:key', (req, res) => {
    const { key } = req.params;
    const { ip, port, version, username } = req.body;
    const userService = new SQLiteService('db/runtime.db');

    // 校验 key
    userService.validateKey(key, (err, isValid) => {
        if (err) {
            return res.status(401).json({ error: err.message });
        }

        // 验证参数
        if (!ip || !port || !version || !username) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        try {
            // 生成随机 UUID
            const uuid = crypto.randomUUID();
            const bot = botManager.createBot(ip, port, version, username, uuid);
            res.json({ message: 'Bot created successfully', bot: { username, ip, port, version, uuid } });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
});

// 新增路由：通过 key 删除 bot
router.delete('/key/deleteBot/:key/:uuid', (req, res) => {
    const { key, uuid } = req.params;
    const userService = new SQLiteService('db/runtime.db');

    // 校验 key
    userService.validateKey(key, (err, isValid) => {
        if (err) {
            return res.status(401).json({ error: err.message });
        }

        const bot = botManager.getBotByUuid(uuid);
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        // 调用 BotManager 的 deleteBot 方法
        botManager.deleteBot(uuid);
        res.json({ message: 'Bot deleted successfully' });
    });
});

// 新增路由：通过 key 和 name 获取 bot 信息
router.get('/key/getBotByName/:key/:name', (req, res) => {
    const { key, name } = req.params;
    const userService = new SQLiteService('db/runtime.db');

    // 校验 key
    userService.validateKey(key, (err, isValid) => {
        if (err) {
            return res.status(401).json({ error: err.message });
        }

        // 获取 bot 信息
        const bot = botManager.getBotByName(name);
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        res.json({
            username: bot.username,
            ip: bot.presetIp || 'Unknown',
            port: bot.presetPort || 'Unknown',
            version: bot.version,
            uuid: bot.uuid
        });
    });
});

// 新增路由：通过 key 和 uuid 获取 bot 信息
router.get('/key/getBotByUuid/:key/:uuid', (req, res) => {
    const { key, uuid } = req.params;
    const userService = new SQLiteService('db/runtime.db');

    // 校验 key
    userService.validateKey(key, (err, isValid) => {
        if (err) {
            return res.status(401).json({ error: err.message });
        }

        // 获取 bot 信息
        const bot = botManager.getBotByUuid(uuid);
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        res.json({
            username: bot.username,
            ip: bot.presetIp || 'Unknown',
            port: bot.presetPort || 'Unknown',
            version: bot.version,
            uuid: bot.uuid
        });
    });
});

module.exports = router;