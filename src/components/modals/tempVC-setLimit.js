const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const setLimitmodal = new ModalBuilder()
    .setCustomId(`tempVC-setLimit`)
    .setTitle(`Mennyi legyen a hangcsatornád limite?`);

const textInput = new TextInputBuilder()
    .setCustomId(`setLimitInput`)
    .setLabel(`Csatorna limite:`)
    .setPlaceholder(`Írj 0-át, hogy megszüntesd a limitet; Max: 99`)
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
        let getLimitInput = interaction.fields.getTextInputValue('setLimitInput');
        getLimitInput = parseInt(getLimitInput);

        if (getLimitInput < 0) {
            getLimitInput = 0
        };
        
        if (isNaN(getLimitInput)) {
            await interaction.editReply({
                content: `A bevitt érték nem egy szám!`,
                ephemeral: true
            })
        } else {
            interaction.channel.setUserLimit(`${getLimitInput}`);
            await interaction.editReply({
                content: `Csatorna taglimite mostantól **${getLimitInput}**!`,
                ephemeral: true
            });
        }
    },
    setLimitmodal
};