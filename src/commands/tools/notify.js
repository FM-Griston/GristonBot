const { TWITCHCLIENTID, TWITCHCLIENTSECRET, YOUTUBEAPIKEY } = process.env;
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const connection = require('../../connectToDB');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("notify")
        .setDescription("Miről küldjek értesítést?")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option => option
            .setName("platform")
            .setDescription("Melyik platformodról küldjek értesítést?")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("azonosító")
            .setDescription("Kitől küldjek értesítőt? (Twitch: felhasználónév; YouTube: csatorna azonosító)")
            .setRequired(true)
        )
        .addChannelOption(option => option
            .setName("csatorna")
            .setDescription("Melyik csatornára küldjem az értesítéseket?")
            .setRequired(true)    
        )
        .addStringOption(option => option
            .setName("tartalom")
            .setDescription("Mi legyen az értesítőben? (Új sor: \\n)")
        )
        .addStringOption(option => option
            .setName("időlimit")
            .setDescription("Mennyi idő teljen el legalább két értesítő között? (Másodpercben megadva!)")
        ),
    async autocomplete(interaction, client) {
        const focusedValue = interaction.options.getFocused();
        const choices = ["Twitch", "YouTube"];
        const filtered = choices.filter((choice) =>
            choice.startsWith(focusedValue)
        );

        await interaction.respond(
            filtered.map((choice) => ({ name: choice, value: choice }))
        );
    },
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const optionPlatform = interaction.options.getString("platform").toLowerCase();
        const optionUserId = interaction.options.getString("azonosító");
        const optionChannel = interaction.options.get("csatorna");
        const optionContent = interaction.options.getString("tartalom");
        const optionTimeLimit = parseInt(interaction.options.getString("időlimit"));

        if (optionChannel.channel.type !== 0 && optionChannel.channel.type !== 5) {
            return interaction.editReply({
                content: `${optionChannel.id} nem egy szöveges csatorna!`,
                ephemeral: true
            });
        }

        if (optionPlatform === "twitch") {
            await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCHCLIENTID}&client_secret=${TWITCHCLIENTSECRET}&grant_type=client_credentials`, {
                method: 'POST',
            })
            .then(response => response.json())
            .then(response => {
                const accessToken = response.access_token
                fetch(`https://api.twitch.tv/helix/users?login=${optionUserId}`, {
                    method: 'GET',
                    headers: {
                        'Client-ID': TWITCHCLIENTID,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                .then(response => response.json())
                .then(response => {
                    if (response.error || !response.data[0]) {
                        return interaction.editReply({
                            content: `Ismeretlen Twitch csatorna!`,
                            ephemeral: true
                        });
                    };
                    const optionTwitchUserId = response.data[0].id
                    fetch(`https://api.twitch.tv/helix/streams?user_id=${optionTwitchUserId}`, {
                        method: 'GET',
                        headers: {
                            'Client-ID': TWITCHCLIENTID,
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                    .then(response => response.json())
                    .then(response => {
                        connection.query(`SELECT twitchUserId FROM GuildNotifiers WHERE guildId = '${interaction.guild.id}'`, async function(error, result) {
                            if (error) throw error;

                            const twitchUserId = result[0].twitchUserId;

                            if (twitchUserId === null) {
                                connection.query(`UPDATE GuildNotifiers SET twitchUserId = '${optionTwitchUserId}', twitchChannelId = '${optionChannel.channel.id}' WHERE guildId = '${interaction.guild.id}'`);
                                
                                if (response.data[0]) {
                                    connection.query(`UPDATE GuildNotifiers SET twitchLastStreamStart = '${response.data[0].started_at}' WHERE guildId = '${interaction.guild.id}'`);
                                }
                                if (optionContent !== null) {
                                    connection.query(`UPDATE GuildNotifiers SET twitchMessage = '${optionContent}' WHERE guildId = '${interaction.guild.id}'`);
                                };
                                if (optionTimeLimit) {
                                    connection.query(`UPDATE GuildNotifiers SET twitchTimeLimit = '${optionTimeLimit}' WHERE guildId = '${interaction.guild.id}'`);
                                } else {
                                    return interaction.editReply({
                                        content: `Twitch értesítő **sikeresen beállítva**! Mivel nem számot adtál meg időlimitnek, ezért nincsen időlimit beállítva!`,
                                        ephemeral: true
                                    });
                                };
                                
                                await interaction.editReply({
                                    content: `Twitch értesítő **sikeresen beállítva**!`,
                                    ephemeral: true
                                });
                            } else {
                                return interaction.editReply({
                                    content: "Már van Twitch beállítva értesítő ezen a szerveren! Ha szeretnéd törölni, akkor használd az `/editnotifier twitch delete` parancsot!",
                                    ephemeral: true
                                });
                            }
                        });
                    });
                })
            });
        } else if (optionPlatform === "youtube") {
            await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${optionUserId}&maxResults=2&order=date&key=${YOUTUBEAPIKEY}`)
            .then(response => response.json())
            .then(response => {
                if (response.error) {
                    return interaction.editReply({
                        content: `Ismeretlen YouTube csatorna! Használd a csatorna azonosítóját!`,
                        ephemeral: true
                    });
                };

                connection.query(`SELECT youtubeUserId FROM GuildNotifiers WHERE guildId = '${interaction.guild.id}'`, async function(error, result) {
                    if (error) throw error;

                    const youtubeUserId = result[0].youtubeUserId;

                    if (youtubeUserId === null) {
                        connection.query(`UPDATE GuildNotifiers SET youtubeUserId = '${optionUserId}', youtubeChannelId = '${optionChannel.channel.id}' WHERE guildId = '${interaction.guild.id}'`);

                        for (let i = 0; i < 2; i++) {
                            if (response.items[i]) {
                                if (response.items[i].id.kind === "youtube#video") {
                                    connection.query(`UPDATE GuildNotifiers SET youtubeLastVideoId = JSON_SET(youtubeLastVideoId, '$[${i}]', '${response.items[i].id.videoId}') WHERE guildId = '${interaction.guild.id}'`);
                                };
                            } else {
                                connection.query(`UPDATE GuildNotifiers SET youtubeLastVideoId = JSON_SET(youtubeLastVideoId, '$[${i}]', 'NULL') WHERE guildId = '${interaction.guild.id}'`);
                            }
                        };
                        if (optionContent !== null) {
                            connection.query(`UPDATE GuildNotifiers SET youtubeMessage = '${optionContent}' WHERE guildId = '${interaction.guild.id}'`);
                        };

                        await interaction.editReply({
                            content: `YouTube értesítő **sikeresen beállítva**!`,
                            ephemeral: true
                        });
                    } else {
                        return interaction.editReply({
                            content: "Már van beállítva YouTube értesítő ezen a szerveren! Ha szeretnéd törölni, akkor használd az `/editnotifier youtube delete` parancsot!",
                            ephemeral: true
                        });
                    }
                })
            })
        } else {
            return interaction.editReply({
                content: `Ismeretlen platform!`,
                ephemeral: true
            });
        };
    }
};

