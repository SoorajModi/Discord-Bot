const source = require('rfr');

const { sendMessage, getChannel } = source('bot/utils/util');

function setMusicChannel(message, args, config) {
    const channel = getChannel(message.guild, args[0]);
    if (!channel) return sendMessage(message.channel, `${args[0]} is not a valid channel`);

    return config.setMusicChannel(channel.id)
        .save()
        .then(() => sendMessage(message.channel, 'Settings updated.'))
        .catch((err) => sendMessage(message.channel, 'Error Something went wrong:', err));
}

module.exports = {
    args: 1,
    name: 'set-music-channel',
    botAdmin: true,
    description: 'set the channel that should be watched for Spotify tracks',
    usage: '<channel>',
    aliases: [],
    execute: setMusicChannel,
    docs: `#### Set music channel
- Command: \`!set-music-channel\`
- Returns: music channel Botomir will watch for is set and a success or failure message is sent
- Example usage:
\`\`\`
User:
> !set-music-channel #songs

Botomir
> Settings updated.
\`\`\``,
};
