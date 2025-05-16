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

        // 修改：监听所有消息事件（包括聊天消息和其他系统消息）
        bot.on('messagestr', (message) => {
            bot.chatMessages.push({
                content: message, // 消息内容
                timestamp: new Date().toISOString() // 时间戳
            });
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

    // 新增方法：向指定Bot发送消息或指令
    sendMessageToBot(uuid, message) {
        const bot = this.getBotByUuid(uuid);
        if (!bot) {
            throw new Error('Bot not found');
        }

        // 模拟发送消息（实际应用中可能需要根据Bot的状态进行判断）
        bot.chat(message); // 假设Bot有chat方法用于发送消息
    }

    // 新增函数：重生指定的Bot
    respawnBot(uuid) {
        const bot = this.getBotByUuid(uuid);
        if (!bot) {
            throw new Error('Bot not found');
        }

        // 假设重生操作是重新创建Bot实例
        const newBot = this.createBot(bot.host, bot.port, bot.version, bot.username, uuid);
        return newBot;
    }

    // 修改函数：删除指定的Bot
    deleteBot(uuid) {
        const bot = this.getBotByUuid(uuid);
        if (!bot) {
            throw new Error('Bot not found'); // 增强错误信息
        }

        try {
            // 结束Bot连接
            bot.end();
            // 从管理器中移除Bot
            this.removeBot(uuid);
            console.log(`Bot with UUID ${uuid} has been successfully deleted.`); // 添加日志
        } catch (err) {
            console.error(`Failed to delete Bot with UUID ${uuid}:`, err); // 捕获异常并记录日志
            throw new Error(`Failed to delete Bot: ${err.message}`); // 抛出详细错误信息
        }
    }
}

module.exports = new BotManager();