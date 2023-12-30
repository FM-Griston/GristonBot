const { SlashCommandBuilder, ActionRowBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const connection = require('../../connectToDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("editnotifier")
        .setDescription("Egyik értesítő módosítása/törlése.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => subcommand
            .setName("twitch")
            .setDescription("Twitch értesítő módosítása.")
            .addStringOption(option => option
                .setName("twitch_opció")
                .setDescription("Mit módosítsak az értesítőn?")
                .setAutocomplete(true)
                .setRequired(true)
            ),
        )
        .addSubcommand(subcommand => subcommand
            .setName("youtube")
            .setDescription("YouTube értesítő módosítása.")
            .addStringOption(option => option
                .setName("youtube_opció")
                .setDescription("Mit módosítsak az értesítőn?")
                .setAutocomplete(true)
                .setRequired(true)
            ),
        ),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices;

        if (focusedOption.name === "twitch_opció") {
            choices = ["törlés", "azonosító", "csatorna", "üzenet", "időlimit"];
        } else if (focusedOption.name === "youtube_opció") {
            choices = ["törlés", "azonosító", "csatorna", "üzenet" ];
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map((choice) => ({ name: choice, value: choice }))
        );
    },
    
    async execute(interaction, client) {
        const platform = interaction.options.getSubcommand();
        const optionOption = interaction.options.getString(`${platform}_opció`).toLowerCase();
        module.exports = { platform };

        connection.query(`SELECT twitchUserId, youtubeUserId FROM GuildNotifiers WHERE guildId = '${interaction.guild.id}'`, async function(error, result) {
            if (error) throw error;
            
            const twitchUserId = result[0].twitchUserId;
            const youtubeUserId = result[0].youtubeUserId;

            if (platform === "twitch" && twitchUserId === null) { 
                return interaction.reply({
                    content: `Nincs beállítva Twitch értesítő ezen a szerveren!`,
                    ephemeral: true
                });
            } else if (platform === "youtube" && youtubeUserId === null) {
                return interaction.reply({
                    content: `Nincs beállítva YouTube értesítő ezen a szerveren!`,
                    ephemeral: true
                });
            };

            switch (optionOption) {
                case "törlés": {
                    await interaction.deferReply({ ephemeral: true });

                    if (platform === "twitch") {
                        connection.query(`UPDATE GuildNotifiers SET twitchUserId = NULL, twitchChannelId = NULL, twitchMessage = NULL, twitchLastStreamStart = NULL, twitchTimeLimit = 0 WHERE guildId = '${interaction.guild.id}'`);
    
                        interaction.editReply({
                            content: `Twitch értesítő **sikeresen törölve**!`,
                            ephemeral: true
                        });
                    } else {
                        connection.query(`UPDATE GuildNotifiers SET youtubeUserId = NULL, youtubeChannelId = NULL, youtubeMessage = NULL, youtubeLastVideoId = '[]' WHERE guildId = '${interaction.guild.id}'`);
                        
                        interaction.editReply({
                            content: `YouTube értesítő **sikeresen törölve**!`,
                            ephemeral: true
                        });
                    }
                    
                    break;
                }
                case "azonosító": {
                    const setUserIdModal = client.modals.get('setNotifierUserId');
    
                    interaction.showModal(setUserIdModal.setNotifierUserIdmodal);
                    
                    break;
                }
                case "csatorna": {
                    const channelSelectMenu = client.selectMenus.get('channelSelectMenu').channelSelectMenu;
                    channelSelectMenu.setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
    
                    const channelSelectMenumsg = await interaction.reply({
                        content: `Válaszd ki a csatornát amelyre ezentúl küldjem az értesítőt!`,
                        components: [new ActionRowBuilder().addComponents(channelSelectMenu)],
                        ephemeral: true
                    });
    
                    const channelSelectCollector = await channelSelectMenumsg.createMessageComponentCollector();
    
                    channelSelectCollector.on('collect', async (interaction) => {
                        if (interaction.customId === 'channelSelectMenu') {
                            const value = interaction.values[0];
                            
                            client.channels.fetch(value).then(selectedChannel => {
                                if (platform === "twitch") {
                                    connection.query(`UPDATE GuildNotifiers SET twitchChannelId = '${selectedChannel.id}' WHERE guildId = '${interaction.guild.id}'`);
    
                                    interaction.reply({
                                        content: `Mostantól a Twitch értesítőket a **${selectedChannel} csatornára** küldöm!`,
                                        ephemeral: true
                                    });
                                } else {
                                    connection.query(`UPDATE GuildNotifiers SET youtubeChannelId = '${selectedChannel.id}' WHERE guildId = '${interaction.guild.id}'`);
    
                                    interaction.reply({
                                        content: `Mostantól a YouTube értesítőket a **${selectedChannel} csatornára** küldöm!`,
                                        ephemeral: true
                                    });
                                }
                            }).catch(console.error);
                        } else {
                            return;
                        }
                    });
                    break;
                }
                case "üzenet": {
                    const setUserIdModal = client.modals.get('setNotifierMessage');
    
                    interaction.showModal(setUserIdModal.setNotifierMessagemodal);

                    break;
                }
                case "időlimit": {
                    const setNotifierTimeLimit = client.modals.get('setNotifierTimeLimit');

                    interaction.showModal(setNotifierTimeLimit.setNotifierTimeLimitmodal);

                    break;
                }
                default: {
                    interaction.reply({
                        content: `Ismeretlen opció!`,
                        ephemeral: true
                    });
                    
                    break;
                }
            }
        });
    },
};