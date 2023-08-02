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
            emoji: {id: '1135537688804602006'},
            value: `setName`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Taglimit`,
            description: `Csatorna taglimitének megváltoztatása`,
            emoji: {id: '1135537686908772372'},
            value: `setLimit`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Játéknév`,
            description: `Csatorna nevének átállítása az általad játszott játékra`,
            emoji: {id: '1135537685818257479'},
            value: `setNameToGame`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Bitráta`,
            description: `Csatorna bitrátájának megváltoztatása`,
            emoji: {id: '1135537984662409216'},
            value: `setBitrate`
        }),
    );

module.exports = { 
    data: {
        name: `tempVCSETTINGSeditor-menu`,
    },
    settingsEditormenu 
};