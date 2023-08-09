const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const connection = require('../../connectToDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveroleroidles")
        .setDescription("Engedélyezed, hogy a tétlenek külön rangot kapjanak?")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addBooleanOption(option => option
            .setName("állapot")
            .setDescription("Be legyen kapcsolva vagy nem?")
            .setRequired(true)
        ),
    async execute(interaction, client) {
        const option = interaction.options.getBoolean('állapot');

        connection.query(`SELECT giveRoleToIdles, roleGivenToIdlesId FROM GuildConfigurable WHERE guildId = '${interaction.guild.id}'`, async function (error, result) {
            if (error) throw error;

            const roleGivenToIdlesId = result[0].roleGivenToIdlesId;
            const giveRoleToIdles = result[0].giveRoleToIdles;

            if (option) {
                if (roleGivenToIdlesId === null) {
                    interaction.showModal(client.modals.get('setIdleRoleName').setIdleRoleName);
                } else {
                    connection.query(`UPDATE GuildConfigurable SET giveRoleToIdles = 1 WHERE guildId = '${interaction.guild.id}'`);

                    const roleGivenToIdles = interaction.guild.roles.cache.get(roleGivenToIdlesId);

                    await interaction.reply({
                        content: `A tétlenek mostantól automatikusan megkapják a **${roleGivenToIdles}** rangot!`,
                        ephemeral: true
                    });
                };
            } else {
                if(giveRoleToIdles === 1) {
                    connection.query(`UPDATE GuildConfigurable SET giveRoleToIdles = 0 WHERE guildId = '${interaction.guild.id}'`)
                    await interaction.reply({
                        content: `A tétlenek mostantól nem kapnak külön rangot!`,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: `A tétlenek eddig se kaptak külön rangot!`,
                        ephemeral: true
                    });
                };
            }
        });
    },
};