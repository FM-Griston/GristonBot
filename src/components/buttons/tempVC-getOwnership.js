const { ButtonBuilder, ButtonStyle } = require('discord.js')
const ownershipButton = new ButtonBuilder()
    .setCustomId(`tempVC-getOwnership`)
    .setLabel(`Csatorna átvétele`)
    .setStyle(ButtonStyle.Primary);

module.exports = {
    data: {
        name: `getOwnership`
    },
    ownershipButton
}