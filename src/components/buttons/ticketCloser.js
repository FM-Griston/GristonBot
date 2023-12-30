const { ButtonBuilder, ButtonStyle } = require('discord.js')
const ticketCloserButton = new ButtonBuilder()
    .setCustomId(`ticketCloser`)
    .setEmoji({ name: '🗑️'})
    .setLabel(`Ticket lezárása`)
    .setStyle(ButtonStyle.Danger);

module.exports = {
    data: {
        name: `ticketCloser`
    },
    button: ticketCloserButton
}