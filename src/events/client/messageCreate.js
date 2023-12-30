const { EmbedBuilder, ComponentType, ActionRowBuilder } = require('discord.js');
const connection = require('../../connectToDB');
const { clientColour } = require('../../bot');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        const ticketId = message.channel.name;

        connection.query(`SELECT ticketLogChannelId, openerId, threadLogId FROM GuildConfigurable, Tickets WHERE GuildConfigurable.guildId = Tickets.guildId AND Tickets.ticketChannelId = '${message.channel.id}'`, async function(error, result) {
            if (error) throw error;
            if (!result[0]) return;

            const ticketLogChannelId = result[0].ticketLogChannelId;
            const openerId = result[0].openerId;
            const threadLogId = result[0].threadLogId;
            const openerName = message.author.username;
            const fetchedMessage = await message.fetch()
            const logEmbed = new EmbedBuilder();

            if (threadLogId === '') {
                const welcomemsg = Array.from(await message.channel.messages.fetch())[1][1];
                const openedTicketEmbed = new EmbedBuilder()
                    .setTitle("Ticket sikeresen elküldve a moderátoroknak!")
                    .setDescription("Mostantól csak a moderátorok tudják lezárni a ticketet! Kérlek várj a válaszukra!")
                    .setColor(clientColour)
                    .setTimestamp();
                
                welcomemsg.edit({ embeds: [openedTicketEmbed], components: [] });

                await client.channels.fetch(ticketLogChannelId).then(ticketLogChannel => {
                    const ticketCloserButton = client.buttons.get('ticketCloser').button;
                    const newOpenedTickedEmbed = new EmbedBuilder()
                        .setTitle("Új Ticket lett nyitva!")
                        .setThumbnail(message.author.displayAvatarURL())
                        .setColor('Green')
                        .setTimestamp();
                    
                    if (fetchedMessage.content.length > 997) {
                        newOpenedTickedEmbed.setFields({ name: "A Ticket:", value: `${fetchedMessage.content.slice(0, 997)}...` })
                    } else {
                        newOpenedTickedEmbed.setFields({ name: "A Ticket:", value: fetchedMessage.content })
                    }
                    newOpenedTickedEmbed.addFields(
                        { name: "Ticket azonosító:", value: ticketId, inline: true },
                        { name: "Ticket nyitója:", value: openerName, inline: true },
                        { name: "Státusz:", value: "🟢 Nyitva", inline: true }
                    );
                    
                    ticketLogChannel.send({
                        content: `@everyone`,
                        embeds: [newOpenedTickedEmbed],
                        components: [new ActionRowBuilder().addComponents(ticketCloserButton)]
                    })
                    .then(threadStartmsg => {
                        threadStartmsg.startThread({name: `Ticket azonosító: ${ticketId}`})
                        .then(threadLog => {
                            connection.query(`UPDATE Tickets SET threadLogId = '${threadLog.id}' WHERE ticketChannelId = '${message.channel.id}'`);
    
                            newOpenedTickedEmbed.setDescription(`Ezen a csatornán tudsz válaszolni: ${message.channel}. Ha névtelenül szeretnél válaszolni, akkor a ${threadLog} gondolatmenetben leírhatod a választ, és azt továbbítom!`);
                            threadStartmsg.edit({ embeds: [newOpenedTickedEmbed] });

                            if (fetchedMessage.content.length > 997) {
                                const fullTicket = new EmbedBuilder()
                                    .setTitle("Teljes Ticket")
                                    .setDescription(fetchedMessage.content)
                                    .setColor('Green');
                                
                                threadLog.send({embeds: [fullTicket]})
                            }
                        });
                    })
                });
            } else {
                client.channels.fetch(threadLogId).then(threadLog => {
                    logEmbed.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() });
                    logEmbed.setTitle(threadLog.name);

                    switch (message.author.id) {
                        case openerId: {
                            logEmbed.setFields({ name: "A nyitó üzenete:", value: fetchedMessage.content });
                            logEmbed.setColor('DarkGreen');
                            
                            break;
                        };

                        default: {
                            logEmbed.setFields({ name: "Moderátori válasz:", value: fetchedMessage.content });
                            logEmbed.setColor('Blue');
                            
                            break;
                        };
                    };
    
                    threadLog.send({ embeds: [logEmbed] });
                })
            };
        });

        connection.query(`SELECT ticketChannelId FROM Tickets WHERE threadLogId = ${message.channel.id}`, async function(error, result) {
            if (error) throw error;
            if (!result[0]) return;

            const ticketChannelId = result[0].ticketChannelId;
            const anonymAnswerDeleteButton = client.buttons.get('ticketAnonymAnswerDelete').button
            const anonymAnswerSendButton = client.buttons.get('ticketAnonymAnswerSend').button
            const fetchedMessage = await message.fetch()

            const anonymAnswerEmbed = new EmbedBuilder()
                .setTitle("Moderátori válasz")
                .setDescription(fetchedMessage.content)
                .setColor('Blue')
                .setTimestamp();

            const askMessage = await message.reply({
                content: `El szeretnéd küldeni ezt az üzenetet?\n\nElőnézet:`,
                embeds: [anonymAnswerEmbed],
                components: [new ActionRowBuilder().addComponents(anonymAnswerDeleteButton, anonymAnswerSendButton)]
            });
            message.delete().catch(console.error);

            const buttonInteractionCollector = await askMessage.createMessageComponentCollector({ ComponentType: ComponentType.Button });
            buttonInteractionCollector.on('collect', async (interaction) => {
                askMessage.delete().catch(console.error);

                if (interaction.customId === 'ticketAnonymAnswerSend') {
                    const logEmbed = new EmbedBuilder()
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle(interaction.channel.name)
                        .setFields({ name: "Névtelen moderátori válasz:", value: interaction.message.embeds[0].data.description })
                        .setColor('Blue')


                    client.channels.fetch(ticketChannelId).then(ticketChannel => 
                        ticketChannel.send({ embeds: [anonymAnswerEmbed] })
                    );

                    interaction.channel.send({ embeds: [logEmbed] });
                } else return;
            })
        });
    }
};