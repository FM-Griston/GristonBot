const { EmbedBuilder } = require('discord.js');
const { clientColour } = require('../../bot');

const specialUsersListEmbed = new EmbedBuilder()
        .setTitle(`Engedélyezett/Kitiltott felhasználok`)
        .setDescription(`Itt láthatod az engedélyezett, illetve kitiltott felhasználókat!\n**MEGJEGYZÉS:** A 10. engedélyezett/kitiltott felhasználó után (átlagosan) 12 másodperces késéssel kerül fel a listára a többi felhasználó!`)
        .setColor(clientColour)

module.exports = {
    data: {
        name: `tempVCspecialUsersList`
    },
    embed: specialUsersListEmbed 
};