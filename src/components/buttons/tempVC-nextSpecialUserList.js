const { ButtonBuilder, ButtonStyle } = require('discord.js')
const nextSpecialUserListButton = new ButtonBuilder()
    .setCustomId(`nextSpecialUserList`)
    .setEmoji({ name: '▶️'})
    .setStyle(ButtonStyle.Primary);

module.exports = {
    data: {
        name: `nextSpecialUserList`
    },
    nextSpecialUserListButton
}