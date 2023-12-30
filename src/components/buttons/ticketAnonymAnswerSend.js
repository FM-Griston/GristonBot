const { ButtonBuilder, ButtonStyle } = require('discord.js')
const ticketAnonymAnswerSendButton = new ButtonBuilder()
    .setCustomId(`ticketAnonymAnswerSend`)
    .setEmoji({ name: '✔️'})
    .setStyle(ButtonStyle.Success);

module.exports = {
    data: {
        name: `ticketAnonymAnswerSend`
    },
    button: ticketAnonymAnswerSendButton
}