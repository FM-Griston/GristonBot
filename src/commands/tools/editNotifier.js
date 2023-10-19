const { SlashCommandBuilder, ActionRowBuilder, PermissionFlagsBits, ConnectionService } = require('discord.js');
const connection = require('../../connectToDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("editnotifier")
        .setDescription("Egyik értesítő módosítása/törlése.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option => option
            .setName("platform")
            .setDescription("Melyik értesítőt módosítsam/töröljem?")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("opció")
            .setDescription("Mit módosítsak az értesítőn?")
            .setAutocomplete(true)
            .setRequired(true)
        ),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices;

        if (focusedOption.name === "platform") {
            choices = ["Twitch", "YouTube"];
        } else if (focusedOption.name === "opció") {
            choices = ["törlés", "azonosító", "csatorna", "üzenet"];
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map((choice) => ({ name: choice, value: choice }))
        );
    },
    
    async execute(interaction, client) {
        const optionPlatform = interaction.options.getString("platform").toLowerCase();
        const optionOption = interaction.options.getString("opció").toLowerCase();
        module.exports = { optionPlatform };

        connection.query(`SELECT twitchUserId, youtubeUserId FROM GuildNotifiers WHERE guildId = '${interaction.guild.id}'`, async function(error, result) {
            if (error) throw error;
            
            const twitchUserId = result[0].twitchUserId;
            const youtubeUserId = result[0].youtubeUserId;

            if (optionPlatform !== "twitch" && optionPlatform !== "youtube") {
                return interaction.reply({
                    content: `Ismeretlen platform!`,
                    ephemeral: true
                })
            } else if (optionPlatform === "twitch" && twitchUserId === null) { 
                return interaction.reply({
                    content: `Nincs beállítva Twitch értesítő ezen a szerveren!`,
                    ephemeral: true
                });
            } else if (optionPlatform === "youtube" && youtubeUserId === null) {
                return interaction.reply({
                    content: `Nincs beállítva YouTube értesítő ezen a szerveren!`,
                    ephemeral: true
                });
            };

            switch (optionOption) {
                case "törlés": {
                    if (optionPlatform === "twitch") {
                        connection.query(`UPDATE GuildNotifiers SET twitchUserId = NULL, twitchChannelId = NULL, twitchMessage = NULL, twitchLastStreamStart = NULL WHERE guildId = '${interaction.guild.id}'`);
    
                        interaction.reply({
                            content: `Twitch értesítő **sikeresen törölve**!`,
                            ephemeral: true
                        });
                    } else {
                        connection.query(`UPDATE GuildNotifiers SET youtubeUserId = NULL, youtubeChannelId = NULL, youtubeMessage = NULL, youtubeLastVideoId = '[]' WHERE guildId = '${interaction.guild.id}'`);
                        
                        interaction.reply({
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
                                console.log(selectedChannel)
    
                                if (selectedChannel.type !== 0) {
                                    return interaction.reply({
                                        content: `${selectedChannel} nem egy szöveges csatorna!`,
                                        ephemeral: true
                                    });
                                }

                                if (optionPlatform === "twitch") {
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