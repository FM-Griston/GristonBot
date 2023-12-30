const { ButtonBuilder, ButtonStyle } = require('discord.js')
const ticketCreatorButton = new ButtonBuilder()
    .setCustomId(`ticketCreator`)
    .setEmoji({ name: '📨'})
    .setStyle(ButtonStyle.Success);

module.exports = {
    data: {
        name: `ticketCreator`
    },
    button: ticketCreatorButton
}