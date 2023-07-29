const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const setNamemodal = new ModalBuilder()
    .setCustomId(`tempVC-setName`)
    .setTitle(`Mi legyen a hangcsatornád neve?`);

const textInput = new TextInputBuilder()
    .setCustomId(`setNameInput`)
    .setLabel(`Csatorna neve:`)
    .setMaxLength(100)
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

setNamemodal.addComponents(new ActionRowBuilder().addComponents(textInput));

module.exports = {
    data: {
        name: `tempVC-setName`
    },
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        interaction.channel.setName(`${interaction.fields.getTextInputValue("setNameInput")}`);
        
        await interaction.editReply({
            content: `Csatorna neve mostantól **${interaction.fields.getTextInputValue("setNameInput")}**!`,
            ephemeral: true
        });
    },
    setNamemodal
};