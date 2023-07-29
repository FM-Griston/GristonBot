const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const settingsEditormenu = new StringSelectMenuBuilder()
    .setCustomId(`tempVCSETTINGSeditor-menu`)
    .setPlaceholder(`Csatornabeállítások módosítása:`)
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions(
        new StringSelectMenuOptionBuilder({
            label: `Név`,
            description: `Csatorna nevének megváltoztatása`,
            emoji: {id: '1133036553929760912'},
            value: `setName`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Taglimit`,
            description: `Csatorna taglimitének megváltoztatása`,
            emoji: {id: '1133036551123763260'},
            value: `setLimit`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Játéknév`,
            description: `Csatorna nevének átállítása az általad játszott játékra`,
            emoji: {id: '1133036549408301086'},
            value: `setNameToGame`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Bitráta`,
            description: `Csatorna bitrátájának megváltoztatása`,
            emoji: {id: '1133036547030126784'},
            value: `setBitrate`
        }),
    );

module.exports = { 
    data: {
        name: `tempVCSETTINGSeditor-menu`,
    },
    settingsEditormenu 
};