const { ChannelType, PermissionsBitField, ActionRowBuilder } = require('discord.js');
const connection = require('../../connectToDB');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        const guild = interaction.guild;

        switch (interaction.customId) {
            case 'ticketCreator': {
                const opener = interaction.user;
                const everyoneId = interaction.guild.id;
                const ticketWelcomeEmbed = client.embeds.get('ticketWelcome').embed;
                const ticketCloserButton = client.buttons.get('ticketCloser').button;
    
                await interaction.deferReply({ ephemeral: true });
                
                const ticketChannel = await guild.channels.create({
                    name: `${opener.username}-${Date.now()}`,
                    type: ChannelType.GuildText,
                    parent: interaction.channel.parent.id,
                    permissionOverwrites: [
                        {
                            id: everyoneId,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: opener.id,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });
                
                connection.query(`INSERT INTO Tickets VALUES ('${guild.id}', '${ticketChannel.id}', '${opener.id}', CURRENT_TIMESTAMP, '')`);
                
                await ticketChannel.send({
                    content: `${opener}`,
                    embeds: [ticketWelcomeEmbed],
                    components: [new ActionRowBuilder().addComponents(ticketCloserButton)]
                });
                await interaction.editReply({
                    content: `Ticket **sikeresen létrehozva**! Ez a csatorna, amibe írhatod a visszajelzésedet: ${ticketChannel}`,
                    ephemeral: true
                });

                await wait(20 * 1000);
                interaction.deleteReply().catch(console.error);

                await wait(5 * 60 * 1000)
                if (ticketChannel.messages.cache.size === 1) return ticketChannel.delete();

                break;
            };

            case 'ticketCloser': {
                connection.query(`SELECT ticketLogChannelId, ticketChannelId, threadLogId FROM GuildConfigurable, Tickets WHERE threadLogId = '${interaction.message.id}' AND GuildConfigurable.guildId = Tickets.guildId`, async function(error, result) {
                    if (error) throw error;
                    if (!result[0]) return;

                    const ticketLogChannelId = result[0].ticketLogChannelId;
                    const ticketChannelId = result[0].ticketChannelId;
                    const threadLogId = result[0].threadLogId;

                    client.channels.fetch(ticketLogChannelId).then(ticketLogChannel => 
                        ticketLogChannel.messages.fetch(threadLogId).then(statusMessage => 
                            statusMessage.edit({components: []})
                        ).catch(console.error)
                    );

                    module.exports = { ticketCloser: interaction.member }
                    client.channels.fetch(ticketChannelId).then(ticketChannel => ticketChannel.delete()).catch(console.error);
                });

                connection.query(`SELECT guildId FROM Tickets WHERE ticketChannelId = '${interaction.channel.id}'`, async function(error, result) {
                    if (error) throw error;
                    if (!result[0]) return;

                    interaction.channel.delete();
                });

                break;
            };
        }
    }
}