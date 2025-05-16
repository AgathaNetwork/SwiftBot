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

        // 新增：存储聊天消息的数组
        bot.chatMessages = [];

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
            this.removeBot(uuid); // 使用 uuid 删除 bot
        });

        // 新增：监听聊天消息事件
        bot.on('chat', (username, message) => {
            bot.chatMessages.push({ username, message, timestamp: new Date().toISOString() });
            // 限制聊天消息数量，避免内存占用过大
            if (bot.chatMessages.length > 100) {
                bot.chatMessages.shift();
            }
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

    // 新增函数：获取Bot的属性信息
    getBotProperties(uuid) {
        const bot = this.getBotByUuid(uuid);
        if (!bot) {
            return null; // 如果找不到对应的bot，返回null
        }
        const position = bot.entity ? bot.entity.position : { x: 0, y: 0, z: 0 }; // 确保 position 存在
        const ping = bot.player ? bot.player.ping : 0; // 确保 ping 存在
        const username = bot.username; // 获取 bot 的玩家名

        // 修改：从 position 中获取世界名
        const world = bot.game.dimension || 'Unknown'; // 使用 nullish 合并操作符更简洁
        return {
            uuid: uuid,
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },
            ping: ping,
            username: username, // 添加玩家名
            world: world // 使用从 position 中获取的世界名
        };
    }

    // 新增函数：获取Bot的聊天消息
    getBotChatMessages(uuid) {
        const bot = this.getBotByUuid(uuid);
        if (!bot) {
            return null; // 如果找不到对应的bot，返回null
        }
        return bot.chatMessages;
    }
}

module.exports = new BotManager();