const { ButtonBuilder, ButtonStyle } = require('discord.js')
const ticketAnonymAnswerDeleteButton = new ButtonBuilder()
    .setCustomId(`ticketAnonymAnswerDelete`)
    .setEmoji({ name: '✖️'})
    .setStyle(ButtonStyle.Danger);

module.exports = {
    data: {
        name: `ticketAnonymAnswerDelete`
    },
    button: ticketAnonymAnswerDeleteButton
}