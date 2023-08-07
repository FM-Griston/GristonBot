const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const connection = require('../../connectToDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("createtempvcenv")
        .setDescription("Ideiglenes hangcsatorna rendszer beüzemelése.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option => option
            .setName("kategórianév")
            .setDescription("Kategória név megadása (alap: Ideiglenes hangcsatornák).")
        )
        .addStringOption(option => option
            .setName("csatornakészítőnév")
            .setDescription("Hangcsatorna készitő nevének megadása (alap: ➕ Hangcsatorna készítő).")
        ),
    async execute(interaction, client) {
        connection.query(`SELECT tempVCcategoryId, tempVCmakerId FROM GuildConfigurable WHERE guildId = '${interaction.guild.id}'`, async function (error, result) {
            if (error) {
                return interaction.reply({
                    content: `Hiba történt a parancs futtatása közben!`,
                    ephemeral: true
                });
            };
            
            if(result[0].tempVCcategoryId === null && result[0].tempVCmakerId === null) {
                let categoryName = interaction.options.getString('kategórianév');
                if (categoryName === null) {
                    categoryName = "Ideiglenes hangcsatornák"
                };
                const tempVCcategory = await interaction.guild.channels.create({
                    name: `${categoryName}`,
                    type: ChannelType.GuildCategory
                });
        
                let tempVCmakerName = interaction.options.getString('csatornakészítőnév');
                if (tempVCmakerName === null) {
                    tempVCmakerName = "➕ Hangcsatorna készítő"
                };
                const tempVCmaker = await interaction.guild.channels.create({
                    name: `${tempVCmakerName}`,
                    type: ChannelType.GuildVoice,
                    parent: tempVCcategory, 
                    userLimit: '0'
                });
                connection.query(`UPDATE GuildConfigurable SET tempVCcategoryId = '${tempVCcategory.id}', tempVCmakerId = '${tempVCmaker.id}' WHERE guildId = '${interaction.guild.id}'`);
                await interaction.reply({
                    content: `Ideiglenes hangcsatorna rendszer sikeresen létrehozva!\nKategórianév: **${categoryName}**\nCsatorna készítő név: **${tempVCmakerName}**`,
                    ephemeral: true
                });
            } else if (result[0].tempVCcategoryId === null) {
                let categoryName = interaction.options.getString('kategórianév');
                if (categoryName === null) {
                    categoryName = "Ideiglenes hangcsatornák"
                };
                const tempVCcategory = await interaction.guild.channels.create({
                    name: `${categoryName}`,
                    type: ChannelType.GuildCategory
                });
                client.channels.fetch(result[0].tempVCmakerId).then(channel =>
                    channel.setParent(tempVCcategory)
                );
                connection.query(`UPDATE GuildConfigurable SET tempVCcategoryId = '${tempVCcategory.id}' WHERE guildId = '${interaction.guild.id}'`);
                await interaction.reply({
                    content: `Mivel a hangcsatorna készítő létezik, ezért csak a kategória lett létrehozva **${categoryName}** néven!`,
                    ephemeral: true
                });
            } else if (result[0].tempVCmakerId === null) {
                let tempVCmakerName = interaction.options.getString('csatornakészítőnév');
                if (tempVCmakerName === null) {
                    tempVCmakerName = "➕ Hangcsatorna készítő"
                };
                const tempVCmaker = await interaction.guild.channels.create({
                    name: `${tempVCmakerName}`,
                    type: ChannelType.GuildVoice,
                    userLimit: '0'
                });
                client.channels.fetch(result[0].tempVCcategoryId).then(tempVCcategory =>
                    tempVCmaker.setParent(tempVCcategory)
                );
                connection.query(`UPDATE GuildConfigurable SET tempVCmakerId = '${tempVCmaker.id}' WHERE guildId = '${interaction.guild.id}'`);
                await interaction.reply({
                    content: `Mivel a kategória létezik, ezért csak a hangcsatorna készítő lett létrehozva **${tempVCmakerName}** néven!`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: `Már van ideiglenes hangcsatorna rendszer a szerveren!`,
                    ephemeral: true
                });
            };
        });
    },
};