const { readdirSync } = require('fs');

module.exports = (client) => {
    client.handleComponents = async () => {
        const componentFolder = readdirSync(`./src/components`);
        for (const folder of componentFolder) {
            const componentFiles = readdirSync(`./src/components/${folder}`).filter(
                file => file.endsWith('.js')
            );
            
            const { embeds, selectMenus, modals, buttons } = client;

            switch (folder) {
                case "embeds": {
                    for (const file of componentFiles) {
                        const embed = require(`../../components/${folder}/${file}`);
                        embeds.set(embed.data.name, embed);
                    }
                    break;
                }
                case "selectMenus": {
                    for (const file of componentFiles) {
                        const menu = require(`../../components/${folder}/${file}`);
                        selectMenus.set(menu.data.name, menu);
                    }
                    break;
                }
                
                case "modals": {
                    for (const file of componentFiles) {
                        const modal = require(`../../components/${folder}/${file}`);
                        modals.set(modal.data.name, modal);
                    }
                    break;
                }

                case "buttons": {
                    for (const file of componentFiles) {
                        const button = require(`../../components/${folder}/${file}`);
                        buttons.set(button.data.name, button);
                    }
                    break;
                }

                default: {
                    break;
                }
            }
        }
    }
}