const { EmbedBuilder } = require('discord.js');
const { clientColour } = require('../../bot');

const editorembed = new EmbedBuilder()
        .setTitle(`Ideiglenes hangcsatorna-beállító`)
        .setDescription(`Az ideiglenes hangcsatornád beállításához használd a legördülő menüket!`)
        .setColor(clientColour)
        .setAuthor({ 
            iconURL: "https://cdn.discordapp.com/attachments/798677589489090562/1125516079343603862/GreenBot_pk.png",
            name: "GreenBot"
        });

module.exports = {
    editorembed 
};