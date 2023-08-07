const connection = require('../../connectToDB');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        if (member.user === client.user) {
            try {
                connection.query(`DELETE FROM Guilds WHERE guildId = '${member.guild.id}'`);
                connection.query(`DELETE FROM GuildConfigurable WHERE guildId = '${member.guild.id}'`);
            } catch (e) {
                console.log(e)
            };
        };
    }
};