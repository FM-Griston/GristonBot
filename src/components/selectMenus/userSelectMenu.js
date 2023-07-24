const { UserSelectMenuBuilder } = require('discord.js');

const userSelectMenu = new UserSelectMenuBuilder()
    .setCustomId(`userSelectMenu`)
    .setPlaceholder(`Válassz ki 1 vagy több felhasználót!`)
    .setMinValues(1)
    .setMaxValues(25);

module.exports = { 
    data: {
        name: `userSelectMenu`,
    },
    userSelectMenu
};