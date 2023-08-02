const { ButtonBuilder, ButtonStyle } = require('discord.js')
const deleteSpecialUsersListButton = new ButtonBuilder()
    .setCustomId(`deleteSpecialUsersList`)
    .setEmoji({ name: '🗑️'})
    .setStyle(ButtonStyle.Danger);

module.exports = {
    data: {
        name: `deleteSpecialUsersList`
    },
    deleteSpecialUsersListButton
}