const connection = require('../../connectToDB');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        connection.query(`SELECT tempVCcategoryId, tempVCmakerId, JSON_LENGTH(voiceChannelCloners) AS voiceChannelClonersLength, twitchChannelId, youtubeChannelId FROM GuildConfigurable, GuildNotifiers WHERE GuildConfigurable.guildId = GuildNotifiers.guildId AND GuildConfigurable.guildId = '${channel.guild.id}'`, async function (error, result) {
            if (error) throw error;

            const tempVCcategoryId = result[0].tempVCcategoryId;
            const tempVCmakerId = result[0].tempVCmakerId;
            const voiceChannelClonersLength = result[0].voiceChannelClonersLength;
            const twitchChannelId = result[0].twitchChannelId;
            const youtubeChannelId = result[0].youtubeChannelId;

            if (channel.id === tempVCcategoryId) {
                connection.query(`UPDATE GuildConfigurable SET tempVCcategoryId = NULL WHERE guildId = '${channel.guild.id}'`);
            } else if (channel.id === tempVCmakerId) {
                connection.query(`UPDATE GuildConfigurable SET tempVCmakerId = NULL WHERE guildId = '${channel.guild.id}'`);
            } else if (channel.id === twitchChannelId) {
                channel.guild.fetchAuditLogs({'actionType': 'CHANNEL_DELETE'})
                    .then(logs => logs.entries.find(entry => entry.target.id == channel.id))
                    .then(entry => {
                        const deleter = entry.executor;
                        deleter.send(`Kitörölted a(z) *${channel.guild.name}* szerver Twitch értesítő csatornáját! Ezzel leáll az értesítés küldés ezen a szerveren!`);
                    });
                connection.query(`UPDATE GuildNotifiers SET twitchUserId = NULL, twitchChannelId = NULL, twitchMessage = NULL, twitchLastStreamStart = NULL WHERE guildId = '${channel.guild.id}'`);
            } else if (channel.id === youtubeChannelId) {
                channel.guild.fetchAuditLogs({'actionType': 'CHANNEL_DELETE'})
                    .then(logs => logs.entries.find(entry => entry.target.id == channel.id))
                    .then(entry => {
                        const deleter = entry.executor;
                        deleter.send(`Kitörölted a(z) *${channel.guild.name}* szerver Youtube értesítő csatornáját! Ezzel leáll az értesítés küldés ezen a szerveren!`);
                    });
                connection.query(`UPDATE GuildNotifiers SET youtubeUserId = NULL, youtubeChannelId = NULL, youtubeMessage = NULL, youtubeLastVideoId = NULL WHERE guildId = '${channel.guild.id}'`);
            }
            else {
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