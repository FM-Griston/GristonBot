const connection = require('../../connectToDB');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        connection.query(`SELECT tempVCcategoryId, tempVCmakerId FROM GuildConfigurable WHERE guildId = '${channel.guild.id}'`, async function (error, result) {
            if (error) throw error;

            if (channel.id === result[0].tempVCcategoryId) {
                connection.query(`UPDATE GuildConfigurable SET tempVCcategoryId = NULL WHERE guildId = '${channel.guild.id}'`);
            } else if (channel.id === result[0].tempVCmakerId) {
                connection.query(`UPDATE GuildConfigurable SET tempVCmakerId = NULL WHERE guildId = '${channel.guild.id}'`);
            };
        });
    }
};