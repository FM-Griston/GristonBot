const { TWITCHCLIENTID, TWITCHCLIENTSECRET } = process.env;
const connection = require('../../connectToDB');
const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
const { clientColour } = require('../../bot');

module.exports = (client) => {
    client.checkStream = async () => {
        connection.query(`SELECT twitchUserId, twitchChannelId, twitchMessage, twitchLastStreamStart, twitchTimeLimit FROM GuildNotifiers WHERE twitchUserId IS NOT NULL`, async function(error, result) {
            if (error) throw error;

            const twitchUserInfo = result;

            connection.query(`SELECT COUNT(twitchUserId) AS twitchUserCount FROM GuildNotifiers WHERE twitchUserId IS NOT NULL`, async function(error, result) {
                if (error) throw error;

                const twitchUserCount = result[0].twitchUserCount;

                for (let i = 0; i < twitchUserCount; i++) {
                    const twitchUserId = twitchUserInfo[i].twitchUserId;

                    connection.query(`SELECT TIMESTAMPDIFF(SECOND, (SELECT lastTwitchNotification FROM GuildNotifiers WHERE twitchUserId = '${twitchUserId}'), CURRENT_TIMESTAMP) AS notificationTimeDiff`, async function(error, result) {
                        if (error) throw error;

                        const notificationTimeDiff = result[0].notificationTimeDiff;
                        const twitchTimeLimit = twitchUserInfo[i].twitchTimeLimit;

                        await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCHCLIENTID}&client_secret=${TWITCHCLIENTSECRET}&grant_type=client_credentials`, {
                            method: 'POST',
                        })
                        .then(response => response.json())
                        .then(response => {
                            const accessToken = response.access_token;
                            const twitchChannelId = twitchUserInfo[i].twitchChannelId;
                            const twitchMessage = twitchUserInfo[i].twitchMessage;
                            const twitchLastStreamStart = twitchUserInfo[i].twitchLastStreamStart;
                            fetch(`https://api.twitch.tv/helix/users?id=${twitchUserId}`, {
                                method: 'GET',
                                headers: {
                                    'Client-ID': TWITCHCLIENTID,
                                    'Authorization': `Bearer ${accessToken}`
                                }
                            })
                            .then(response => response.json())
                            .then(response => {
                                const userProfileImg = response.data[0].profile_image_url;
    
                                fetch(`https://api.twitch.tv/helix/streams?user_id=${twitchUserId}`, {
                                    method: 'GET',
                                    headers: {
                                        'Client-ID': TWITCHCLIENTID,
                                        'Authorization': `Bearer ${accessToken}`
                                    }
                                })
                                .then(response => response.json())
                                .then(response => {
                                    if (response.data[0]) {
                                        const currentStreamStart = response.data[0].started_at;

                                        if (notificationTimeDiff <= twitchTimeLimit) return connection.query(`UPDATE GuildNotifiers SET twitchLastStreamStart = '${currentStreamStart}' WHERE twitchUserId = '${twitchUserId}'`);
    
                                        if (currentStreamStart !== twitchLastStreamStart) {
                                            const streamTitle = response.data[0].title;
                                            const twitchUsername = response.data[0].user_name;
                                            const streamGame = response.data[0].game_name;
                                            const streamThumbnail = response.data[0].thumbnail_url
                                                .replace("{width}", "1280")
                                                .replace("{height}", "720");
                                            
                                            client.channels.fetch(twitchChannelId).then(twitchChannel =>
                                                twitchChannel.send({files: [streamThumbnail]}).then(message => {
                                                    const notificationEmbed = new EmbedBuilder()
                                                        .setAuthor({ name: `${twitchUsername} éppen streamel!`, iconURL: userProfileImg})
                                                        .setTitle(streamTitle)
                                                        .setURL(`https://twitch.tv/${twitchUsername}`)
                                                        .addFields(
                                                            { name: "Játék", value: streamGame, inline: true },
                                                        )
                                                        .setImage(Array.from(message.attachments)[0][1].attachment)
                                                        .setColor(clientColour);
                                                    
                                                    message.channel.send({
                                                        content: twitchMessage,
                                                        embeds: [notificationEmbed]
                                                    });

                                                    message.delete();
                                                })
                                            ).catch(console.error);
                                            
                                            connection.query(`UPDATE GuildNotifiers SET twitchLastStreamStart = '${currentStreamStart}', lastTwitchNotification = CURRENT_TIMESTAMP WHERE twitchUserId = '${twitchUserId}'`);
                                        }
                                    } else if (response.data === "[]" && twitchLastStreamStart !== null) {
                                        connection.query(`UPDATE GuildNotifiers SET twitchLastStreamStart = '${currentStreamStart}' WHERE twitchUserId = '${twitchUserId}'`);
                                    };
                                })
                                .catch(console.error);
                            })
                            .catch(console.error);
                        })
                        .catch(console.error);
                    })
                };
            });
        })
    }
};