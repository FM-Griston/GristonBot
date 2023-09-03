const connection = require('../../connectToDB');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        connection.query(`SELECT tempVCcategoryId, tempVCmakerId, JSON_LENGTH(voiceChannelCloners) AS voiceChannelClonersLength FROM GuildConfigurable WHERE guildId = '${channel.guild.id}'`, async function (error, result) {
            if (error) throw error;

            const tempVCcategoryId = result[0].tempVCcategoryId;
            const tempVCmakerId = result[0].tempVCmakerId;
            const voiceChannelClonersLength = result[0].voiceChannelClonersLength;

            if (channel.id === tempVCcategoryId) {
                connection.query(`UPDATE GuildConfigurable SET tempVCcategoryId = NULL WHERE guildId = '${channel.guild.id}'`);
            } else if (channel.id === tempVCmakerId) {
                connection.query(`UPDATE GuildConfigurable SET tempVCmakerId = NULL WHERE guildId = '${channel.guild.id}'`);
            } else {
                for (let i = 0; i <= voiceChannelClonersLength; i++) {
                    connection.query(`SELECT JSON_EXTRACT(voiceChannelCloners, '$[${i}]') AS voiceChannelClonerId FROM GuildConfigurable WHERE guildId = '${channel.guild.id}'`, async function(error, result) {
                        if (error) throw error;

                        const voiceChannelClonerId = result[0].voiceChannelClonerId;

                        if (channel.id === voiceChannelClonerId) {
                            connection.query(`UPDATE GuildConfigurable SET voiceChannelCloners = JSON_REMOVE(voiceChannelCloners, '$[${i}]') WHERE guildId = '${channel.guild.id}'`);
                        };
                    });
                };
            };
        });
    }
};