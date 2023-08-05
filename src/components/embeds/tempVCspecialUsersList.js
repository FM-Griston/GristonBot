const { EmbedBuilder } = require('discord.js');
const { clientColour } = require('../../bot');

const specialUsersListEmbed = new EmbedBuilder()
        .setTitle(`Engedélyezett/Kitiltott felhasználok`)
        .setDescription(`Itt láthatod az engedélyezett, illetve kitiltott felhasználókat!\n**MEGJEGYZÉS:** A 10. engedélyezett/kitiltott felhasználó után (átlagosan) 12 másodperces késéssel kerül fel a listára a többi felhasnáló!`)
        .setColor(clientColour)
        .setAuthor({ 
            iconURL: "https://cdn.discordapp.com/attachments/798677589489090562/1125516079343603862/GreenBot_pk.png",
            name: "GreenBot"
        });

module.exports = {
    specialUsersListEmbed 
};