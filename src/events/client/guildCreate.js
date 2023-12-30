const connection = require('../../connectToDB');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        try {
            connection.query(`INSERT INTO Guilds VALUES ('${guild.id}', '${guild.ownerId}')`);
            connection.query(`INSERT INTO GuildConfigurable (guildId, voiceChannelCloners) VALUES ('${guild.id}', '[]')`);
            connection.query(`INSERT INTO GuildNotifiers (guildId) VALUES ('${guild.id}')`);
        } catch (e) {
            console.log(e)
        };
    }
};