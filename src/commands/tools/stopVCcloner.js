const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const connection = require('../../connectToDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stopvccloner")
        .setDescription("Egy hangcsatorna másoló leállítása.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option => option
            .setName("csatorna")
            .setDescription("Melyik csatorna másolását állítsam le?")
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        ),
    async execute(interaction, client) {
        const option = interaction.options.get('csatorna')
        const optionId = option.channel.id;

        connection.query(`SELECT JSON_LENGTH(voiceChannelCloners) AS voiceChannelClonersLength FROM GuildConfigurable WHERE guildId = '${interaction.guild.id}'`, async function(error, result) {
            if (error) throw error;

            const voiceChannelClonersLength = result[0].voiceChannelClonersLength;
            let haveResult = false;
       
            for (let i = 0; i <= voiceChannelClonersLength; i++) {
                connection.query(`SELECT JSON_EXTRACT(voiceChannelCloners, '$[${i}]') AS voiceChannelClonerId FROM GuildConfigurable WHERE guildId = '${interaction.guild.id}'`, async function(error, result) {
                    if (error) throw error;

                    const voiceChannelClonerId = result[0].voiceChannelClonerId;

                    if (optionId === voiceChannelClonerId) {
                        connection.query(`UPDATE GuildConfigurable SET voiceChannelCloners = JSON_REMOVE(voiceChannelCloners, '$[${i}]') WHERE guildId = '${interaction.guild.id}'`);
                        haveResult = true;

                        return interaction.reply({
                            content: `<#${optionId}> hangcsatorna másoló **sikeresen leállítva**!`,
                            ephemeral: true
                        });
                    } else if (i === voiceChannelClonersLength && !haveResult) {
                        return interaction.reply({
                            content: `<#${optionId}> hangcsatorna **nem egy másoló**!`,
                            ephemeral: true
                        });
                    };
                });
            };
        });
    },
};