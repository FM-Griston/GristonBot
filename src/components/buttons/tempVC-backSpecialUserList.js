const { ButtonBuilder, ButtonStyle } = require('discord.js')
const backSpecialUserListButton = new ButtonBuilder()
    .setCustomId(`backSpecialUserList`)
    .setEmoji({ name: '◀️'})
    .setStyle(ButtonStyle.Primary);

module.exports = {
    data: {
        name: `backSpecialUserList`
    },
    backSpecialUserListButton
}