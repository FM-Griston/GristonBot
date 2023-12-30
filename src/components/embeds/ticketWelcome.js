const { EmbedBuilder } = require('discord.js');
const { clientColour } = require('../../bot');

const ticketWelcomeEmbed = new EmbedBuilder()
    .setTitle(`Üdvözöllek, ez a ticket csatornád!`)
    .setDescription(`Ideírhatod a visszajelzésedet a szerver moderátorainak. Fogalmazz érthetően, és próbálj minél kevesebb külön üzenetet küldeni! Ha nem írod meg visszajelzésedet 5 percen belül, akkor a ticket automatikusan törlésre kerül!\n\nVéletlenül nyitottad meg ezt a ticketet? Akkor a piros *Ticket lezárása* gomb megnyomásával lezárhatod! A törlés nem vonható vissza!`)
    .setColor(clientColour)
    .setTimestamp();

module.exports = {
    data: {
        name: `ticketWelcome`
    },
    embed: ticketWelcomeEmbed
};