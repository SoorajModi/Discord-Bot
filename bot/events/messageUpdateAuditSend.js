const source = require('rfr');
const moment = require('moment');

const { sendMessage } = source('bot/utils/util');

const logger = source('bot/utils/logger');
const { Settings } = source('models/settings');
const { Message } = source('models/message');

function auditHandler(oldM, newM) {
    let message;
    let oldContent = 'unknown';

    if (newM.guild === null) return;

    Promise.all([newM.partial ? newM.fetch() : newM])
        .then((res) => {
            [message] = res;

            if (message.guild === null || message.author.bot) {
                throw new Error('Can not send audit for DMs or for bot messages');
            }

            return Message.find(message.guild.id, message.channel.id, message.id);
        })
        .then((m) => {
            if (m) oldContent = m.content;
            return Settings.getServerSettings(message.guild.id);
        })
        .then((config) => {
            if (!config || !config.auditChannel) {
                logger.info(`audit channel for guild ${message.guild.id} has not been configured`);
                return;
            }

            const channel = message.guild.channels.cache.get(config.auditChannel);
            if (!channel) {
                logger.error(`audit channel for guild ${message.guild.id} does not exist`);
                return;
            }

            const time = moment(newM.editedAt).format('MMMM Do YYYY, HH:mm:ssZ');
            console.log(time);
            sendMessage(channel, `**UPDATED**\nauthor: ${message.author.username}\nChannel: <#${message.channel.id}>\nAt: ${time}\nOld Content: ${oldContent}\nNew Content: ${message.content}`);
        })
        .catch((e) => {
            logger.error('failed to send the update message to the audit channel');
            logger.error(e);
        });
}

module.exports = {
    name: 'messageUpdate',
    once: false,
    execute: auditHandler,
};
