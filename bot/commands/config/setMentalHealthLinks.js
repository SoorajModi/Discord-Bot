const source = require('rfr');

const { sendMessage } = source('bot/utils/util');

function generateMappings(text) {
    const mappingRegex = /^\s*([^:]+)\s*:\s*(.*)\s*$/;

    return text.split('\n')
        .map((l) => mappingRegex.exec(l))
        .filter((p) => p !== null && p.length === 3)
        .map((r) => ({
            name: r[1],
            url: r[2],
        }));
}

function setMentalHealth(message, args, config) {
    return config.setMentalHealthLinks(generateMappings(args.join(' '))).save()
        .then(() => sendMessage(message.channel, 'Settings updated.'))
        .catch((err) => sendMessage(message.channel, 'Error Something went wrong:', err));
}

module.exports = {
    args: 1,
    name: 'set-mental-health',
    botAdmin: true,
    description: 'Set the links to mental health resources, one link name mapping per line',
    usage: '<name> : <url>',
    aliases: ['set-mh'],
    execute: setMentalHealth,
    docs: `#### Mental Health Links
- Command: \`set-mental-health\`
- Returns: Sends a message saying if the settings were updated successfully or not.
- Example usage:
\`\`\`
User
> !set-mental-health Mental Health Resources : https://www.ccmhs-ccsms.ca/mental-health-resources-1
Mental Health Services : https://switchandclick.com/2020/01/23/guide-to-mechanical-keyboard-cases/

Botomir
> Updated settings.
\`\`\``,
};
