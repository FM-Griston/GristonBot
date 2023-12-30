const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, PermissionsBitField, ActionRowBuilder } = require('discord.js');
const connection = require('../../connectToDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("createticketenv")
        .setDescription("Ticket rendszer beüzemelése.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option => option
            .setName("kategórianév")
            .setDescription("Kategória név megadása (alap: Ticketek).")
        )
        .addStringOption(option => option
            .setName("ticketnyitónév")
            .setDescription("Ticketnyitó csatornanév megadása (alap: ticketnyitás).")
        )
        .addStringOption(option => option
            .setName("tickettár")
            .setDescription("Összefoglaló csatorna nevének megadása (alap: ticket-log).")
        )
        .addStringOption(option => option
            .setName("ticketnyitócím")
            .setDescription("A ticket nyitás leírásának címének megadása (alap: Ticket készítés).")
        )
        .addStringOption(option => option
            .setName("ticketnyitóleírás")
            .setDescription("A ticket nyitás leírásának megadása.")
        )
        .addStringOption(option => option
            .setName("ticketnyitógomb")
            .setDescription("A ticketnyitó gomb szövegének megadása. (alap: Ticket nyitás)")
        ),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        let oCategoryName = interaction.options.getString('kategórianév');
        if (oCategoryName === null) oCategoryName = "Ticketek";

        let oOpenerChannelName = interaction.options.getString('ticketnyitónév');
        if (oOpenerChannelName === null) oOpenerChannelName = "ticketnyitás";

        let oLogChannelName = interaction.options.getString('tickettár');
        if (oLogChannelName === null) oLogChannelName = "ticket-log";

        const oOpenerTitle = interaction.options.getString('ticketnyitócím');
        const oOpenerInstructions = interaction.options.getString('ticketnyitóleírás');
        const oOpenerButtonText = interaction.options.getString('ticketnyitógomb');

        connection.query(`SELECT ticketCategoryId, ticketOpenerChannelId, ticketLogChannelId FROM GuildConfigurable WHERE guildId = '${interaction.guild.id}'`, async function (error, result) {
            if (error) {
                return interaction.editReply({
                    content: `Hiba történt a parancs futtatása közben!`,
                    ephemeral: true
                });
            };

            const ticketCategoryId = result[0].ticketCategoryId;
            const ticketOpenerChannelId = result[0].ticketOpenerChannelId;
            const ticketLogChannelId = result[0].ticketLogChannelId;
            const everyoneId = interaction.guild.id;
            const ticketOpenerEmbed = client.embeds.get('ticketCreator').embed;
            ticketOpenerEmbed.setTitle(`Ticket készítés`);
            ticketOpenerEmbed.setDescription(`A zöld *Ticket készítés* gombra nyomva létre tudsz hozni egy ticketet. Egy ticket arra való, hogy felvedd a szerver moderátoraival a kapcsolatot! Egyszerre egy ticketet nyithatsz meg, és addig nem tudsz újat nyitni, amíg az le nem lett zárva!`);
            
            const ticketOpenerButton = client.buttons.get('ticketCreator').button;
            ticketOpenerButton.setLabel("Ticket készítés");

            if (ticketCategoryId === null) {
                const ticketCategory = await interaction.guild.channels.create({
                    name: oCategoryName,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: everyoneId,
                            deny: [PermissionsBitField.Flags.SendMessages]
                        }
                    ]
                });

                const ticketOpenerChannel = await interaction.guild.channels.create({
                    name: oOpenerChannelName,
                    type: ChannelType.GuildText,
                    parent: ticketCategory
                });

                if (oOpenerTitle !== null) ticketOpenerEmbed.setTitle(oOpenerTitle);
                if (oOpenerInstructions !== null) ticketOpenerEmbed.setDescription(oOpenerInstructions);
                if (oOpenerButtonText !== null) ticketOpenerButton.setLabel(oOpenerButtonText);

                await ticketOpenerChannel.send({
                    embeds: [ticketOpenerEmbed],
                    components: [new ActionRowBuilder().addComponents(ticketOpenerButton)]
                });

                const ticketLogChannel = await interaction.guild.channels.create({
                    name: oLogChannelName,
                    type: ChannelType.GuildText,
                    parent: ticketCategory,
                    permissionOverwrites: [
                        {
                            id: everyoneId,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });

                connection.query(`UPDATE GuildConfigurable SET ticketCategoryId = '${ticketCategory.id}', ticketOpenerChannelId = '${ticketOpenerChannel.id}', ticketLogChannelId = '${ticketLogChannel.id}' WHERE guildId = '${interaction.guild.id}'`);

                await interaction.editReply({
                    content: `Ticket rendszer sikeresen létrehozva!\nKategórianév: **${oCategoryName}**\nTicketnyitó név: **${oOpenerChannelName}**\nTickettár név: **${oLogChannelName}**`,
                    ephemeral: true
                });
            } else if (ticketCategoryId !== null) {
                client.channels.fetch(ticketCategoryId).then(ticketCategory => {
                    let needOpener = false;
                    let needLog = false;

                    if (ticketOpenerChannelId === null) {
                        needOpener = true;

                        interaction.guild.channels.create({
                            name: oOpenerChannelName,
                            type: ChannelType.GuildText,
                            parent: ticketCategory
                        }).then(ticketOpenerChannel => {
                            connection.query(`UPDATE GuildConfigurable SET ticketOpenerChannelId = '${ticketOpenerChannel.id}' WHERE guildId = '${interaction.guild.id}'`);
                        }).catch(console.error);
                    };

                    if (ticketLogChannelId === null) {
                        needLog = true;
                        
                        interaction.guild.channels.create({
                            name: oLogChannelName,
                            type: ChannelType.GuildText,
                            parent: ticketCategory
                        }).then(ticketLogChannel => {
                            connection.query(`UPDATE GuildConfigurable SET ticketLogChannelId = '${ticketLogChannel.id}' WHERE guildId = '${interaction.guild.id}'`);
                        }).catch(console.error);
                    };

                    if (needOpener && needLog) {
                        return interaction.editReply({
                            content: `Mivel még meg van a Ticket rendszer kategóriája, ezért csak a ticketnyitó lett lértehozva **${oOpenerChannelName}** néven, és a tickettár **${oLogChannelName}** néven!`,
                            ephemeral: true
                        });
                    } else if (needOpener) {
                        return interaction.editReply({
                            content: `Mivel még meg van a Ticket rendszer kategóriája, ezért csak a ticketnyitó lett lértehozva **${oOpenerChannelName}** néven!`,
                            ephemeral: true
                        });
                    } else if (needLog) {
                        return interaction.editReply({
                            content: `Mivel még meg van a Ticket rendszer kategóriája, ezért csak a tickettár lett lértehozva **${oLogChannelName}** néven!`,
                            ephemeral: true
                        });
                    } else {
                        return interaction.editReply({
                            content: `Már van Ticket rendszer a szerveren!`,
                            ephemeral: true
                        });
                    };
                }).catch(console.error);
            }
        })
    },
};