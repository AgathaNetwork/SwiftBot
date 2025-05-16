const mineflayer = require('mineflayer');

class BotManager {
    constructor() {
        this.bots = new Map();
    }

    createBot(ip, port, version, username, uuid) {
        const bot = mineflayer.createBot({
            host: ip,
            port: port,
            version: version,
            username: username
        });

        bot.uuid = uuid; // 将 uuid 存储到 bot 对象中

        bot.on('login', () => {
            console.log(`Bot ${username} logged in.`);
        });

        bot.on('kicked', (reason) => {
            console.log(`Bot ${username} kicked from server: ${reason}`);
        });

        bot.on('error', (err) => {
            console.error(`Bot ${username} error: ${err.message}`);
        });

        bot.on('end', () => {
            console.log(`Bot ${username} disconnected from server`);
            this.removeBot(username);
        });

        this.bots.set(uuid, bot); // 使用 uuid 作为键存储 bot
        return bot;
    }

    getBot(uuid) {
        return this.bots.get(uuid); // 通过 uuid 获取 bot
    }

    removeBot(uuid) {
        this.bots.delete(uuid); // 通过 uuid 删除 bot
    }

    getAllBots() {
        return Array.from(this.bots.values());
    }

    getBotCount() {
        return this.bots.size;
    }

    // 新增函数：通过 uuid 获取 bot
    getBotByUuid(uuid) {
        return this.bots.get(uuid);
    }
}

module.exports = new BotManager();