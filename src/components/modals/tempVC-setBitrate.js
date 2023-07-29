const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const setBitratemodal = new ModalBuilder()
    .setCustomId(`tempVC-setBitrate`)
    .setTitle(`Mennyi legyen a hangcsatornád bitrátája?`);

const textInput = new TextInputBuilder()
    .setCustomId(`setBitrateInput`)
    .setLabel(`Csatorna bitrátája:`)
    .setPlaceholder(`Alap: 64000; Min: 8000; Max: 96000`)
    .setMaxLength(6)
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

setBitratemodal.addComponents(new ActionRowBuilder().addComponents(textInput));

module.exports = {
    data: {
        name: `tempVC-setBitrate`
    },
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        const serverBoostTier = interaction.guild.premiumTier;
        let getBitrateInput = interaction.fields.getTextInputValue("setBitrateInput");
        getBitrateInput = parseInt(getBitrateInput);

        if (getBitrateInput < 8000) {
            getBitrateInput = 8000;
        } else if (getBitrateInput > 96000 && serverBoostTier === 0) {
            getBitrateInput = 96000;
        } else if (getBitrateInput > 128000 && serverBoostTier === 1) {
            getBitrateInput = 128000;
        } else if (getBitrateInput > 256000 && serverBoostTier === 2) {
            getBitrateInput = 256000;
        } else if (getBitrateInput > 384000 && serverBoostTier === 3) {
            getBitrateInput = 384000;
        } else if (getBitrateInput) {
            getBitrateInput = 64000;
        }
        
        if (getBitrateInput !== NaN) {
            interaction.channel.setBitrate(getBitrateInput)
            await interaction.editReply({
                content: `Csatorna bitrátája mostantól **${getBitrateInput}**!`,
                ephemeral: true
            });
        } else {
            await interaction.editReply({
                content: `A bevitt érték nem egy szám!`,
                ephemeral: true
            });
        }
    },
    setBitratemodal
};