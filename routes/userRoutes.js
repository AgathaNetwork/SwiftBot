const express = require('express');
const router = express.Router();
const SQLiteService = require('../components/sqliteService');
const userService = new SQLiteService('db/runtime.db');

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

module.exports = router;