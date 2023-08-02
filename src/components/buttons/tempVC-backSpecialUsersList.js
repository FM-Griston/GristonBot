const { ButtonBuilder, ButtonStyle } = require('discord.js')
const backSpecialUsersListButton = new ButtonBuilder()
    .setCustomId(`backSpecialUsersList`)
    .setEmoji({ name: '◀️'})
    .setStyle(ButtonStyle.Primary);

module.exports = {
    data: {
        name: `backSpecialUsersList`
    },
    backSpecialUsersListButton
}