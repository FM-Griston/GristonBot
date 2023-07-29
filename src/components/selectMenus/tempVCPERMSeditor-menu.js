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
            emoji: {id: '1133036545738281090'},
            value: `openness`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Engedélyezés`,
            description: `Egy szervertag beengedése a csatornára`,
            emoji: {id: '1133036544031203358'},
            value: `permit`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Kitiltás`,
            description: `Egy szervertag kitiltása a csatornáról`,
            emoji: {id: '1133036541481078855'},
            value: `reject`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Meghívás`,
            description: `Egy szervertag meghívása a csatornához`,
            emoji: {id: '1133036538830278676'},
            value: `invite`
        }),
        new StringSelectMenuOptionBuilder({
            label: `Láthatóság`,
            description: `Csatorna láthatóságának megváltoztatása`,
            emoji: {id: '1133036536984764468'},
            value: `visibility`
        }),
    );

module.exports = { 
    data: {
        name: `tempVCPERMSeditor-menu`,
    },
    permissionsEditormenu 
};