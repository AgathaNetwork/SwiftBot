const express = require('express');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const app = express();

// 读取配置文件中的port
const configPath = path.join(__dirname, 'config', 'cfg.yml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
const port = config.port;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});