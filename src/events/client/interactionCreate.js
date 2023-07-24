const { InteractionType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error)
                await interaction.reply({
                    content: `Hiba történt a parancs futtatása közben!`,
                    ephemeral: true
                });
            };
        } else if (interaction.isStringSelectMenu()) {
            const { selectMenus } = client;
            const { customId } = interaction;
            const menu = selectMenus.get(customId);
            if (!menu) return new Error("Nincs kód erre a legördülő menüre!");

            //try {
            //    await menu.execute(interaction, client);
            //} catch (error) {
            //    console.error(error);
            //}
            //Pontosan nem tudom, hogy mit csinál ez a rész, szóval kikommentelem, mert minden egyes menüpont kiválasztása után logolja, hogy "menu.execute is not a function" - ettől függetlenül működnek a legördülő menük
        } else if (interaction.type == InteractionType.ModalSubmit) {
            const { modals } = client;
            const { customId } = interaction;
            const modal = modals.get(customId);
            if (!modal) return new Error("Nincs kód erre az adatbevitel mezőre!");
            
            try {
                await modal.execute(interaction, client);
            } catch (error) {
                console.error(error);
            }
        }
    },
};