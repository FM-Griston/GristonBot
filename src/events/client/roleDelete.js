const connection = require('../../connectToDB');

module.exports = {
    name: 'roleDelete',
    async execute(role) {
        connection.query(`SELECT roleGivenToIdlesId FROM GuildConfigurable WHERE guildId = '${role.guild.id}'`, async function (error, result) {
            if (error) throw error;

            if (result[0].roleGivenToIdlesId === role.id) {
                connection.query(`UPDATE GuildConfigurable SET roleGivenToIdlesId = NULL WHERE guildId = '${role.guild.id}'`);
                connection.query(`UPDATE GuildConfigurable SET giveRoleToIdles = 0 WHERE guildId = '${role.guild.id}'`);
            };
        });
    }
};