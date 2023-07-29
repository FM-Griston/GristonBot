const { ActivityType } = require('discord.js');
const presenceOptions = [
    {
        type: ActivityType.Watching,
        text: "Hangcsatorna készítő",
        status: 'idle'
    },
    {
        type: ActivityType.Listening,
        text: "Hangcsatorna beállító",
        status: 'online'
    }
];

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await client.user.setPresence({
            activities: [{
                type: presenceOptions[0].type,
                name: presenceOptions[0].text
            }],
            status: presenceOptions[0].status
        });

        console.log(`${client.user.tag} sikeresen elindult!`);
    },
    presenceOptions
};