const connection = require('../../connectToDB');

module.exports = {
    name: 'presenceUpdate',
    async execute(oldPresence, newPresence) {
        if (oldPresence && oldPresence.status !== newPresence.status && !oldPresence.member.user.bot) {
            const { member, guild } = oldPresence;

            connection.query(`SELECT giveRoleToIdles, roleGivenToIdlesId FROM GuildConfigurable WHERE guildId = '${guild.id}'`, async function (error, result) {
                if (error) throw error;

                const giveRoleToIdles = result[0].giveRoleToIdles;
                const roleGivenToIdlesId = result[0].roleGivenToIdlesId;

                if (giveRoleToIdles === 1 && roleGivenToIdlesId !== null) {
                    const roleGivenToIdles = guild.roles.cache.get(roleGivenToIdlesId);

                    if (newPresence.status === 'idle') {
                        member.roles.add(roleGivenToIdles);
                    } else {
                        member.roles.remove(roleGivenToIdles);
                    };
                };
            });
        }
    }
};