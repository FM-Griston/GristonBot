const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const setLimitmodal = new ModalBuilder()
    .setCustomId(`tempVC-setLimit`)
    .setTitle(`Mennyi legyen a hangcsatornád limite?`);

const textInput = new TextInputBuilder()
    .setCustomId(`setLimitInput`)
    .setLabel(`Csatorna limite:`)
    .setPlaceholder(`Írj 0-át, hogy megszüntesd a limitet!`)
    .setMaxLength(2)
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

setLimitmodal.addComponents(new ActionRowBuilder().addComponents(textInput));

module.exports = {
    data: {
        name: `tempVC-setLimit`
    },
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        let getLimitInput = interaction.fields.getTextInputValue("setLimitInput");
        if (getLimitInput < 0) {
            getLimitInput = 0
        };

        const { newVC } = require('../../events/client/tempVCmaker');
        newVC.setUserLimit(`${getLimitInput}`);
        if (newVC.members.size != 1) {
            console.log(newVC.members);
        }
        await interaction.editReply({
            content: `Csatorna taglimite mostantól **${getLimitInput}**!`,
            ephemeral: true
        });
    },
    setLimitmodal
};