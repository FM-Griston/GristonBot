const { ActionRowBuilder, ComponentType, ALLOWED_SIZES, EmbedBuilder } = require('discord.js');
const connection = require('../../connectToDB');

module.exports = {
    name: 'channelDelete',
    async execute(channel, client) {
        connection.query(`SELECT tempVCcategoryId, tempVCmakerId, JSON_LENGTH(voiceChannelCloners) AS voiceChannelClonersLength, twitchChannelId, youtubeChannelId, ticketCategoryId, ticketOpenerChannelId, ticketLogChannelId FROM GuildConfigurable, GuildNotifiers WHERE GuildConfigurable.guildId = GuildNotifiers.guildId AND GuildConfigurable.guildId = '${channel.guild.id}'`, async function (error, result) {
            if (error) throw error;

            const tempVCcategoryId = result[0].tempVCcategoryId;
            const tempVCmakerId = result[0].tempVCmakerId;
            const voiceChannelClonersLength = result[0].voiceChannelClonersLength;
            const twitchChannelId = result[0].twitchChannelId;
            const youtubeChannelId = result[0].youtubeChannelId;
            const ticketCategoryId = result[0].ticketCategoryId;
            const ticketOpenerChannelId = result[0].ticketOpenerChannelId;
            const ticketLogChannelId = result[0].ticketLogChannelId;

            switch (channel.id) {
                case tempVCcategoryId: {
                    connection.query(`UPDATE GuildConfigurable SET tempVCcategoryId = NULL WHERE guildId = '${channel.guild.id}'`);

                    break;
                }
                case tempVCmakerId: {
                    connection.query(`UPDATE GuildConfigurable SET tempVCmakerId = NULL WHERE guildId = '${channel.guild.id}'`);

                    break;
                }
                case twitchChannelId: {
                    channel.guild.fetchAuditLogs({'actionType': 'CHANNEL_DELETE'})
                        .then(logs => logs.entries.find(entry => entry.target.id == channel.id))
                        .then(entry => {
                            const deleter = entry.executor;
                            deleter.send(`Kitörölted a(z) **${channel.guild.name}** szerver Twitch értesítő csatornáját! Ezzel leáll az értesítés küldés ezen a szerveren!`);
                        })
                        .catch(console.error);
                    connection.query(`UPDATE GuildNotifiers SET twitchUserId = NULL, twitchChannelId = NULL, twitchMessage = NULL, twitchLastStreamStart = NULL WHERE guildId = '${channel.guild.id}'`);

                    break;
                }
                case youtubeChannelId: {
                    channel.guild.fetchAuditLogs({'actionType': 'CHANNEL_DELETE'})
                        .then(logs => logs.entries.find(entry => entry.target.id == channel.id))
                        .then(entry => {
                            const deleter = entry.executor;
                            deleter.send(`Kitörölted a(z) **${channel.guild.name}** szerver Youtube értesítő csatornáját! Ezzel leáll az értesítés küldés ezen a szerveren!`);
                        })
                        .catch(console.error);
                    connection.query(`UPDATE GuildNotifiers SET youtubeUserId = NULL, youtubeChannelId = NULL, youtubeMessage = NULL, youtubeLastVideoId = NULL WHERE guildId = '${channel.guild.id}'`);

                    break;
                }
                case ticketCategoryId: {
                    connection.query(`UPDATE GuildConfigurable SET ticketCategoryId = NULL WHERE guildId = '${channel.guild.id}'`);

                    if (ticketLogChannelId !== null) {
                        client.channels.fetch(ticketLogChannelId).then(ticketLogChannel => {
                            ticketLogChannel.delete().catch(console.error);
                        }).catch(console.error);
                    };

                    if (ticketOpenerChannelId !== null) {
                        client.channels.fetch(ticketOpenerChannelId).then(ticketOpenerChannelId => {
                            ticketOpenerChannelId.delete().catch(console.error);
                        }).catch(console.error);
                    };

                    break;
                }
                case ticketOpenerChannelId: {
                    channel.guild.fetchAuditLogs({'actionType': 'CHANNEL_DELETE'})
                    .then(logs => logs.entries.find(entry => entry.target.id == channel.id))
                    .then(entry => {
                        const deleter = entry.executor;
                        
                        if (deleter !== client.user) {
                            deleter.send(`Kitörölted a(z) **${channel.guild.name}** szerver Ticketnyitóját! A \`/createticketenv\` paranccsal létre tudom újra hozni egy újabb Ticket kategória kihagyásával!`);
                        };
                    })
                    .catch(console.error);

                    connection.query(`UPDATE GuildConfigurable SET ticketOpenerChannelId = NULL WHERE guildId = '${channel.guild.id}'`);
                    
                    break;
                }
                case ticketLogChannelId: {
                    channel.guild.fetchAuditLogs({'actionType': 'CHANNEL_DELETE'})
                    .then(logs => logs.entries.find(entry => entry.target.id == channel.id))
                    .then(entry => {
                        const deleter = entry.executor;
                        
                        if (deleter !== client.user) {
                            deleter.send(`Kitörölted a(z) **${channel.guild.name}** szerver Tickettárját! Nem ajánlott ennek törlése, a \`/createticketenv\` paranccsal létre tudom újra hozni egy újabb Ticket kategória kihagyásával!`);
                        };
                    })
                    .catch(console.error);

                    connection.query(`UPDATE GuildConfigurable SET ticketLogChannelId = NULL WHERE guildId = '${channel.guild.id}'`);
                    
                    break;
                }
                default: {
                    connection.query(`SELECT ticketLogChannelId, threadLogId FROM GuildConfigurable, Tickets WHERE ticketChannelId = '${channel.id}' AND GuildConfigurable.guildId = Tickets.guildId`, async function(error,result) {
                        if (error) throw error;
                        if (!result[0]) return;

                        const ticketLogChannelId = result[0].ticketLogChannelId;
                        const threadLogId = result[0].threadLogId;
                        
                        if (threadLogId !== "") {
                            client.channels.fetch(ticketLogChannelId).then(ticketLogChannel => 
                                ticketLogChannel.messages.fetch(threadLogId).then(statusMessage => {
                                    const currentTimestamp = Date.now().toString();
                                    const ticketCloser = require('./ticketManage').ticketCloser;
                                    const baseEmbed = statusMessage.embeds[0];
                                    baseEmbed.fields[3] = { name: "Státusz:", value: "🔴 Lezárva", inline: true}
    
                                    const newEmbed = EmbedBuilder.from(baseEmbed)
                                        .setTitle("Lezárt Ticket")
                                        .setDescription(`Ez a ticket <t:${currentTimestamp.slice(0, 10)}:f>-kor lett lezárva ${ticketCloser} által.`)
                                        .setColor('Red');
    
                                    statusMessage.edit({embeds: [newEmbed]});
                                }).catch(console.error)
                            ).catch(console.error);
    
                            client.channels.fetch(threadLogId).then(threadLog => threadLog.setLocked(true)).catch(console.error);
                        }

                        connection.query(`DELETE FROM Tickets WHERE ticketChannelId = '${channel.id}'`);

                    });
                    for (let i = 0; i <= voiceChannelClonersLength; i++) {
                        connection.query(`SELECT JSON_EXTRACT(voiceChannelCloners, '$[${i}]') AS voiceChannelClonerId FROM GuildConfigurable WHERE guildId = '${channel.guild.id}'`, async function(error, result) {
                            if (error) throw error;
    
                            const voiceChannelClonerId = result[0].voiceChannelClonerId;
    
                            if (channel.id === voiceChannelClonerId) {
                                connection.query(`UPDATE GuildConfigurable SET voiceChannelCloners = JSON_REMOVE(voiceChannelCloners, '$[${i}]') WHERE guildId = '${channel.guild.id}'`);
                            };
                        });
                    };

                    break;
                }
            }
        });
    }
};