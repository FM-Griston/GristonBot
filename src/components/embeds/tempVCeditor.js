const { EmbedBuilder } = require('discord.js');
const { clientColour } = require('../../bot');

const editorEmbed = new EmbedBuilder()
    .setTitle(`Ideiglenes hangcsatorna-beállító`)
    .setDescription(`Az ideiglenes hangcsatornád beállításához használd a legördülő menüket!`)
    .setColor(clientColour);

module.exports = {
    data: {
        name: `tempVCeditor`
    },
    embed: editorEmbed
};