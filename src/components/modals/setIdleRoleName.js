const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const connection = require('../../connectToDB');

const setIdleRoleName = new ModalBuilder()
    .setCustomId(`setIdleRoleName`)
    .setTitle(`Mi legyen a rang neve amit a tétlenek kapnak?`);

const textInput = new TextInputBuilder()
    .setCustomId(`setIdleRoleNameInput`)
    .setLabel(`Rang neve:`)
    .setMaxLength(100)
    .setRequired(true)
    .setValue(`Tétlen`)
    .setStyle(TextInputStyle.Short);

setIdleRoleName.addComponents(new ActionRowBuilder().addComponents(textInput));

module.exports = {
    data: {
        name: `setIdleRoleName`
    },
    async execute(interaction, client) {
        const roleGivenToIdles = await interaction.guild.roles.create({
            name: `${interaction.fields.getTextInputValue('setIdleRoleNameInput')}`
        });
        connection.query(`UPDATE GuildConfigurable SET roleGivenToIdlesId= '${roleGivenToIdles.id}' WHERE guildId = '${interaction.guild.id}'`);
        connection.query(`UPDATE GuildConfigurable SET giveRoleToIdles = 1 WHERE guildId = '${interaction.guild.id}'`);

        await interaction.reply({
            content: `Tétleneknek adott rang sikeresen létrehozva **${interaction.fields.getTextInputValue('setIdleRoleNameInput')}** néven!`,
            ephemeral: true
        });
        await interaction.followUp({
            content: `A tétlenek mostantól automatikusan megkapják a **${roleGivenToIdles}** rangot!`,
            ephemeral: true
        });
    },
    setIdleRoleName
};