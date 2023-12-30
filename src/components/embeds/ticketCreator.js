const { EmbedBuilder } = require('discord.js');
const { clientColour } = require('../../bot');

const ticketCreatorEmbed = new EmbedBuilder()
    .setColor(clientColour);

module.exports = {
    data: {
        name: `ticketCreator`
    },
    embed: ticketCreatorEmbed
};