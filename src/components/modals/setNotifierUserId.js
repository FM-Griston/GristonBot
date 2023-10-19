const { TWITCHCLIENTID, TWITCHCLIENTSECRET, YOUTUBEAPIKEY } = process.env;
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const connection = require('../../connectToDB');
const fetch = require('node-fetch');

const setNotifierUserIdmodal = new ModalBuilder()
    .setCustomId(`setNotifierUserId`)
    .setTitle(`Mi legyen az új azonosító?`);

const textInput = new TextInputBuilder()
    .setCustomId(`setNotifierUserIdInput`)
    .setLabel(`Azonosító:`)
    .setMaxLength(100)
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

setNotifierUserIdmodal.addComponents(new ActionRowBuilder().addComponents(textInput));

module.exports = {
    data: {
        name: `setNotifierUserId`
    },
    async execute(interaction, client) {
        const platform = require('../../commands/tools/editNotifier').optionPlatform;

        if (platform === "twitch") {
            const twitchUsernameInput = interaction.fields.getTextInputValue("setNotifierUserIdInput");

            await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCHCLIENTID}&client_secret=${TWITCHCLIENTSECRET}&grant_type=client_credentials`, {
                method: 'POST',
            })
            .then(response => response.json())
            .then(response => {
                const accessToken = response.access_token
                fetch(`https://api.twitch.tv/helix/users?login=${twitchUsernameInput}`, {
                    method: 'GET',
                    headers: {
                        'Client-ID': TWITCHCLIENTID,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                .then(response => response.json())
                .then(response => {
                    if (response.error || !response.data[0]) {
                        return interaction.reply({
                            content: `Ismeretlen Twitch csatorna!`,
                            ephemeral: true
                        });
                    };

                    const twitchUserIdInput = response.data[0].id;
                    fetch(`https://api.twitch.tv/helix/streams?user_id=${twitchUserIdInput}`, {
                        method: 'GET',
                        headers: {
                            'Client-ID': TWITCHCLIENTID,
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                    .then(response => response.json())
                    .then(response => {
                        connection.query(`UPDATE GuildNotifiers SET twitchUserId = '${twitchUserIdInput}' WHERE guildId = '${interaction.guild.id}'`);

                        if (response.data[0]) {
                            connection.query(`UPDATE GuildNotifiers SET twitchLastStreamStart = '${response.data[0].started_at}' WHERE guildId = '${interaction.guild.id}'`);
                        } else {
                            connection.query(`UPDATE GuildNotifiers SET twitchLastStreamStart = NULL WHERE guildId = '${interaction.guild.id}'`);
                        }

                        interaction.reply({
                            content: `A Twitch értesítők mostantól a **${twitchUsernameInput}** csatornáról jönnek!`,
                            ephemeral: true
                        });
                    });
                });
            });
        } else {
            const youtubeUserIdInput = interaction.fields.getTextInputValue("setNotifierUserIdInput");
            await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtubeUserIdInput}&maxResults=2&order=date&key=${YOUTUBEAPIKEY}`)
            .then(response => response.json())
            .then(response => {
                if (response.error) {
                    return interaction.reply({
                        content: `Ismeretlen YouTube csatorna! Használd a csatorna azonosítóját!`,
                        ephemeral: true
                    });
                };

                connection.query(`UPDATE GuildNotifiers SET youtubeUserId = '${youtubeUserIdInput}' WHERE guildId = '${interaction.guild.id}'`);
                for (let i = 0; i < 2; i++) {
                    if (response.items[i]) {
                        if (response.items[i].id.kind === "youtube#video") {
                            connection.query(`UPDATE GuildNotifiers SET youtubeLastVideoId = JSON_SET(youtubeLastVideoId, '$[${i}]', '${response.items[i].id.videoId}') WHERE guildId = '${interaction.guild.id}'`);
                        };
                    } else {
                        connection.query(`UPDATE GuildNotifiers SET youtubeLastVideoId = JSON_SET(youtubeLastVideoId, '$[${i}]', 'NULL') WHERE guildId = '${interaction.guild.id}'`);
                    }
                };

                interaction.reply({
                    content: `A YouTube értesítők mostantól a(z) **${response.items[0].snippet.channelTitle}** csatornáról jönnek!`,
                    ephemeral: true
                });
            })
        }
    },
    setNotifierUserIdmodal
};