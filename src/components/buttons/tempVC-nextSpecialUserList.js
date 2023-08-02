const { ButtonBuilder, ButtonStyle } = require('discord.js')
const nextSpecialUsersListButton = new ButtonBuilder()
    .setCustomId(`nextSpecialUsersList`)
    .setEmoji({ name: '▶️'})
    .setStyle(ButtonStyle.Primary);

module.exports = {
    data: {
        name: `nextSpecialUsersList`
    },
    nextSpecialUsersListButton
}