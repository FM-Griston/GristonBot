const { ChannelSelectMenuBuilder } = require('discord.js');

const channelSelectMenu = new ChannelSelectMenuBuilder()
    .setCustomId(`channelSelectMenu`)
    .setPlaceholder(`Válassz ki egy csatornát!`)
    .setMinValues(1)
    .setMaxValues(1);

module.exports = { 
    data: {
        name: `channelSelectMenu`,
    },
    channelSelectMenu
};