const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const connection = require('../../connectToDB');

const setNotifierMessagemodal = new ModalBuilder()
    .setCustomId(`setNotifierMessage`)
    .setTitle(`Mi legyen az értesítő üzenetben?`);

const textInput = new TextInputBuilder()
    .setCustomId(`setMessageInput`)
    .setLabel(`Üzenet:`)
    .setMaxLength(1500)
    .setRequired(true)
    .setStyle(TextInputStyle.Paragraph);

setNotifierMessagemodal.addComponents(new ActionRowBuilder().addComponents(textInput));

module.exports = {
    data: {
        name: `setNotifierMessage`
    },
    async execute(interaction, client) {
        const setMessageInput = interaction.fields.getTextInputValue("setMessageInput");
        const platform = require('../../commands/tools/editNotifier').optionPlatform;

        if (platform === "twitch") {
            connection.query(`UPDATE GuildNotifiers SET twitchMessage = '${setMessageInput}' WHERE guildId = '${interaction.guild.id}'`);
        
            await interaction.reply({
                content: `Twitch értesítő üzenete **sikeresen megváltoztatva**!`,
                ephemeral: true
            });
        } else {
            connection.query(`UPDATE GuildNotifiers SET youtubeMessage = '${setMessageInput}' WHERE guildId = '${interaction.guild.id}'`);
        
            await interaction.reply({
                content: `YouTube értesítő üzenete **sikeresen megváltoztatva**!`,
                ephemeral: true
            });
        }
    },
    setNotifierMessagemodal
};