const connection = require('../../connectToDB');

module.exports = {
    name: 'guildDelete',
    async execute(guild) {
        try {
            connection.query(`DELETE FROM Guilds WHERE guildId = '${guild.id}'`);
            connection.query(`DELETE FROM GuildConfigurable WHERE guildId = '${guild.id}'`);
            connection.query(`DELETE FROM GuildNotifiers WHERE guildId = '${guild.id}'`);
        } catch (e) {
            console.log(e)
        };
    }
};