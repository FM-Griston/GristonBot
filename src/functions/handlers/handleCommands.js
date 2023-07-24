const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

module.exports = (client) => {
    client.handleCommands = async() => {
        const commandFolders = fs.readdirSync(`./src/commands`);
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
            
            const { commands, commandArray} = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
            };
        };

        const clientId = '1125419743235555358';
        const guildId = '792786302638096446';
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
        try {
            console.log('Perjeles parancsok újratöltése...');

            await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
                body: client.commandArray,
            });

            console.log('Perjeles parancsok sikeresen újra lettek töltve!')
        } catch (error) {
            console.error(error);
        };
    };
};