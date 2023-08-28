const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const connection = require('../../connectToDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setvccloner")
        .setDescription("Egy hangcsatorna másoló beállítása.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option => option
            .setName("csatorna")
            .setDescription("Melyik csatornát másoljam csatlakozáskor?")
            .setRequired(true)
        ),
    async execute(interaction, client) {
        const option = interaction.options.get('csatorna');
        const optionId = option.channel.id;
        let haveResult = false;
        
        if (option.channel.type !== 2) {
            return interaction.reply({
                content: `<#${optionId}> nem egy hangcsatorna!`,
                ephemeral: true
            });
        };
       
        connection.query(`SELECT JSON_LENGTH(voiceChannelCloners) AS voiceChannelClonersLength, tempVCmakerId FROM GuildConfigurable WHERE guildId = '${interaction.guild.id}'`, async function(error, result) {
            if (error) throw error;

            const voiceChannelClonersLength = result[0].voiceChannelClonersLength;
            const tempVCmakerId = result[0].tempVCmakerId;

            if (optionId === tempVCmakerId) {
                return interaction.reply({
                    content: `<#${optionId}> hangcsatorna egy ideiglenes hangcsatorna készítő!`,
                    ephemeral: true
                });
            } else {
                for (let i = 0; i <= voiceChannelClonersLength; i++) {
                    connection.query(`SELECT JSON_EXTRACT(voiceChannelCloners, '$[${i}]') AS voiceChannelClonerId FROM GuildConfigurable WHERE guildId = '${interaction.guild.id}'`, async function(error, result) {
                        if (error) throw error;
    
                        const voiceChannelClonerId = result[0].voiceChannelClonerId
                        
                        if (optionId === voiceChannelClonerId) {
                            haveResult = true;
    
                            await interaction.reply({
                                content: `<#${optionId}> hangcsatorna csatlakozásakor **már másolom azt**!`,
                                ephemeral: true
                            });
                        } else if (i === voiceChannelClonersLength && !haveResult) {
                            if (option.channel.parent === null) {
                                return interaction.reply({
                                    content: `Tedd a csatornát egy kategóriába!`,
                                    ephemeral: true
                                });
                            } else {
                                connection.query(`UPDATE GuildConfigurable SET voiceChannelCloners = JSON_SET(voiceChannelCloners, '$[${voiceChannelClonersLength}]', ${option.channel.id}) WHERE guildId = '${interaction.guild.id}'`);
        
                                await interaction.reply({
                                    content: `<#${optionId}> hangcsatorna **sikeresen beállítva** másolóként!`,
                                    ephemeral: true
                                });
                            };
                        };
                    });
                };
            }
        });
    },
};