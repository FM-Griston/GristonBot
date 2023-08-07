const connection = require('../../connectToDB');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        try {
            connection.query(`INSERT INTO Guilds VALUES ('${guild.id}', '${guild.ownerId}', '${guild.roles.cache.find(role => role.name === "@everyone").id}')`);
            connection.query(`INSERT INTO GuildConfigurable (guildId) VALUES ('${guild.id}')`);
        } catch (e) {
            console.log(e)
        };
    }
};