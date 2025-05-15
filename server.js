const express = require('express');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const app = express();
const SQLiteService = require('./components/sqliteService');
const userRoutes = require('./routes/userRoutes'); // 引入用户路由
const dbPath = 'db/runtime.db';
const userService = new SQLiteService(dbPath);
userService.initialize();

// 读取配置文件中的port
const configPath = path.join(__dirname, 'config', 'cfg.yml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
const port = config.port;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// 解析请求体
app.use(express.json());

// 使用用户路由
app.use(userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});