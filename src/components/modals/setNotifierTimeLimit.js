const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const connection = require('../../connectToDB');

const setNotifierTimeLimitmodal = new ModalBuilder()
    .setCustomId(`setNotifierTimeLimit`)
    .setTitle(`Hány másodperc teljen el két értesítő között?`);

const textInput = new TextInputBuilder()
    .setCustomId(`setNotifierTimeLimit`)
    .setLabel(`Időlimit:`)
    .setMaxLength(100)
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

setNotifierTimeLimitmodal.addComponents(new ActionRowBuilder().addComponents(textInput));

module.exports = {
    data: {
        name: `setNotifierTimeLimit`
    },
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        
        const timeLimit = parseInt(interaction.fields.getTextInputValue("setNotifierTimeLimit"));

        if (timeLimit) {
            connection.query(`UPDATE GuildNotifiers SET twitchTimeLimit = '${timeLimit}' WHERE guildId = '${interaction.guild.id}'`);
        } else {
            return interaction.editReply({
                content: `Számot adj meg!`,
                ephemeral: true
            });
        };
        
        await interaction.editReply({
            content: `Az időlimit két Twitch értesítő közötti időlimit sikeresen megváltoztatva **${timeLimit} másodpercre**!`,
            ephemeral: true
        });
    },
    setNotifierTimeLimitmodal
};