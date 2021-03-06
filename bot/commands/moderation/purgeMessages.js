const source = require('rfr');

const { sendMessage } = source('bot/utils/util');
const { Statistics, EventTypes } = source('models/statistics');
const { Audit, Events } = source('models/audit');

const logger = source('bot/utils/logger');

function auditDelete(message, isSuccess, details) {
    let event = new Audit()
        .setGuild(message.guild.id)
        .setChannel(message.channel.id)
        .setUser(message.author.id)
        .setCommand(message.content)
        .setEvent(Events.BATCH_MESSAGES_DELETED)
        .setDetails(details);

    event = isSuccess ? event.setSuccess() : event.setFailed();

    event.save()
        .then(() => logger.info('saved audit event'))
        .catch((e) => logger.error('failed to save audit event', e));
}

function purgeCommand(message, args) {
    if (args.length !== 1) {
        auditDelete(message, false, 'Error you can only give one number for the number of messages to delete');
        return sendMessage(message.channel, 'Error you can only give one number for the number of messages to delete');
    }

    const numMessages = Number.parseInt(args[0], 10);
    if (Number.isNaN(numMessages)) {
        auditDelete(message, false, 'The number of messages to delete must be a number');
        return sendMessage(message.channel, 'The number of messages to delete must be a number');
    }

    return message.channel.bulkDelete(numMessages)
        .then((messages) => {
            logger.warn(`deleted ${messages.size} from channel ${message.channel.name} in ${message.guild.name} by ${message.author.username}`);

            auditDelete(message, true, `successfully deleted ${messages.size} messages`);

            sendMessage(message.channel, `:skull_crossbones: Poof ${messages.size} messages were successfully deleted by ${message.author.toString()}`);
            return new Statistics()
                .setGuild(message.guild.id)
                .setEvent(EventTypes.MESSAGES_DELETED)
                .setDetails(messages.size)
                .save()
                .then(() => logger.info('statistics saved'))
                .catch((e) => logger.error('failed to save statistics', e));
        })
        .catch((e) => {
            auditDelete(message, false, e.message);

            logger.error('failed to delete messages', e);
            sendMessage(message.channel, `Messages failed to delete - ${e.message}`);
        });
}

module.exports = {
    args: 1,
    name: 'purge',
    botAdmin: true,
    description: 'deleted X messages from the channels history from the channel that this is called from. **DANGEROUS**',
    usage: '<number of messages>',
    aliases: ['delete'],
    execute: purgeCommand,
    docs: `#### Purge Messages from Channel
- Command: \`purge\`
- Returns: removed the specified number of messages from the channel this is called in.
- Example usage:
\`\`\`
User
> !purge 5

Botomir
> :skull_crossbones: Poof 1 messages were successfully deleted by @username

\`\`\``,
};
