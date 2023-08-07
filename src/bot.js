require('dotenv').config();
const { TOKEN } = process.env;
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');

const clientColour = "8afc7b";

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ], 
    partials: [Partials.Channel] 
});

client.commands = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.buttons = new Collection();
client.commandArray = [];

module.exports = { client, clientColour };

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
    const functionFiles = fs.readdirSync(`./src/functions/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of functionFiles) require(`./functions/${folder}/${file}`)(client);
};

client.handleEvents();
client.handleCommands();
client.handleComponents();
(async () => {
    require('./connectToDB');
    await client.login(TOKEN);
})();