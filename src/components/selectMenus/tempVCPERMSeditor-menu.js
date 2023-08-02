const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const permissionsEditormenu = new StringSelectMenuBuilder()
    .setCustomId(`tempVCPERMSeditor-menu`)
    .setPlaceholder(`Csatorna hozzáférésének módosítása:`)
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions(
        new StringSelectMenuOptionBuilder({
            label: `Nyitottság`,
            description: `Csatorna nyitottságának megváltoztatása`,
            emoji: {id: '1135537682181791764'},
            value: `connectivity`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Engedélyezés`,
            description: `Egy szervertag beengedése a csatornára`,
            emoji: {id: '1135537680025931868'},
            value: `permit`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Kitiltás`,
            description: `Egy szervertag kitiltása a csatornáról`,
            emoji: {id: '1135537677874253904'},
            value: `reject`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Meghívás`,
            description: `Egy szervertag meghívása a csatornához`,
            emoji: {id: '1135537676108447796'},
            value: `invite`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Láthatóság`,
            description: `Csatorna láthatóságának megváltoztatása`,
            emoji: {id: '1135537674321678356'},
            value: `visibility`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Engedélyezett/Kitiltott felhasználók listája`,
            description: `Egy lista a külön engedélyezett és kitiltott felhasználókról`,
            emoji: {id: '1135537673042395156'},
            value: `specialUsersList`
        })
    );

module.exports = { 
    data: {
        name: `tempVCPERMSeditor-menu`,
    },
    permissionsEditormenu 
};