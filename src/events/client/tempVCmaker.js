const { Events, ChannelType, Collection, ActionRowBuilder, ComponentType, PermissionsBitField } = require('discord.js');
const { editorembed } = require('../../components/embeds/tempVCeditor-embed');
const { settingsEditormenu } = require('../../components/selectMenus/tempVCSETTINGSeditor-menu');
const { permissionsEditormenu } = require('../../components/selectMenus/tempVCPERMSeditor-menu');
const { userSelectMenu } = require('../../components/selectMenus/userSelectMenu');
const { client } = require('../../bot');

const voiceCollection = new Collection();

let VCowner;

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const { member, guild } = oldState;
        const currentChannel = newState.channel;
        const previousChannel = oldState.channel;
        const tempVCcategoryId = '1076894977700933722';
        const tempVCmakerChannelId = '1127275270760562728'
        const everyoneId = '792786302638096446';

        if (previousChannel !== currentChannel && currentChannel && currentChannel.id === tempVCmakerChannelId) {
            const newVC = await guild.channels.create({
                name: `${member.user.username} csatornája`,
                type: ChannelType.GuildVoice,
                parent: currentChannel.parent, 
                userLimit: '0',
                bitrate: 64000
            });
            VCowner = member;
            module.exports = { newVC };
            member.voice.setChannel(newVC);;
            const pingmsg = await newVC.send(`${VCowner}`);
            pingmsg.delete();
            const settingsEditormsg = await newVC.send({
                embeds: [editorembed],
                components: [
                    new ActionRowBuilder().addComponents(settingsEditormenu),
                    new ActionRowBuilder().addComponents(permissionsEditormenu)
                ],
            });
            voiceCollection.set(member.id, newVC.id);
            const stringSelectCollector = await settingsEditormsg.createMessageComponentCollector();
            stringSelectCollector.on('collect', async (interaction) => {
                settingsEditormsg.edit({
                    embeds: [editorembed],
                    components: [
                        new ActionRowBuilder().addComponents(settingsEditormenu),
                        new ActionRowBuilder().addComponents(permissionsEditormenu)
                    ]
                });
                if (interaction.member !== VCowner) {
                    await interaction.deferReply({ ephemeral: true });
                    return await interaction.editReply({
                        content: `Nem te vagy a csatorna tulajdonosa!`,
                        ephemeral: true
                    });
                } else if (interaction.customId === 'tempVCSETTINGSeditor-menu') {
                    const value = interaction.values[0];
                    const tempVCsetName = client.modals.get("tempVC-setName");
                    const tempVCsetLimit = client.modals.get("tempVC-setLimit");
                    const tempVCsetBitrate = client.modals.get("tempVC-setBitrate")
                    
                    if (value === 'setName') {
                        return interaction.showModal(tempVCsetName.setNamemodal);
                    } else if (value === 'setLimit') {
                        return interaction.showModal(tempVCsetLimit.setLimitmodal);
                    } else if (value === 'setNameToGame') {
                        const activity = member.presence.activities;
                        await interaction.deferReply({ ephemeral: true });

                        if (!activity || activity.length === 0 || (activity[0].name === 'Custom Status' && activity.length === 1)) {
                            return await interaction.editReply({
                                content: `Jelenleg nem játszol semmivel!`,
                                ephemeral: true
                            });
                        } else if (activity[0].name === 'Custom Status' && activity.length === 2) {
                            newVC.setName(activity[1].name);
                            return await interaction.editReply({
                                content: `Csatorna neve mostantól **${activity[1].name}**!`,
                                ephemeral: true
                            });
                        }
                        else {
                            newVC.setName(activity[0].name);
                            return await interaction.editReply({
                                content: `Csatorna neve mostantól **${activity[0].name}**!`,
                                ephemeral: true
                            });
                        };
                    } else if (value === 'setBitrate') {
                        return interaction.showModal(tempVCsetBitrate.setBitratemodal);
                    };
                } else if (interaction.customId === 'tempVCPERMSeditor-menu') {
                    const value = interaction.values[0];

                    if (value === 'openness') {
                        if (newVC.permissionsFor(everyoneId).has('Connect')) {
                            await interaction.deferReply({ ephemeral: true });
                            newVC.permissionOverwrites.edit(everyoneId, { Connect: false });
                            await interaction.editReply({
                                content: `A csatornára mostantól **senki sem** csatlakozhat!`,
                                ephemeral: true
                            })
                        } else {
                            await interaction.deferReply({ ephemeral: true });
                            newVC.permissionOverwrites.edit(everyoneId, { Connect: true });
                            await interaction.editReply({
                                content: `A csatornára mostantól **bárki** csatlakozhat!`,
                                ephemeral: true
                            })
                        }
                    } else if (value === 'permit') {
                        const permitUsermsg = await interaction.reply({
                            content: `A felhasználók beengedéséhez válasszd ki őket ebből a legőrdülő menüből!`,
                            components: [new ActionRowBuilder().addComponents(userSelectMenu)],
                            ephemeral: true
                        });

                        const userSelectCollector = await permitUsermsg.createMessageComponentCollector();
                        userSelectCollector.on('collect', async (interaction) => {
                            const values = interaction.values;
                            if (interaction.customId === 'userSelectMenu' && interaction.message.content === `A felhasználók beengedéséhez válasszd ki őket ebből a legőrdülő menüből!`) {
                                await interaction.deferReply({ ephemeral: true });

                                if (newVC.permissionsFor(values[0]).has('Connect') && newVC.permissionsFor(values[0]).has('ViewChannel')) {
                                    await interaction.editReply({
                                        content: `<@${values[0]}> felhasználónak **már van engedélye** a csatlakozáshoz!`
                                    });
                                } else {
                                    newVC.permissionOverwrites.edit(values[0], { Connect: true, ViewChannel: true });
                                    await interaction.editReply({
                                        content: `<@${values[0]}> felhasználó **mostantól csatlakozhat** a csatornához!`
                                    });
                                };
                                for (let i = 1; i < values.length; i++) {
                                    if (newVC.permissionsFor(values[i]).has('Connect') && newVC.permissionsFor(values[i]).has('ViewChannel')) {
                                        await interaction.followUp({
                                            content: `<@${values[i]}> felhasználónak **már van engedélye** a csatlakozáshoz!`
                                        });
                                    } else {
                                        newVC.permissionOverwrites.edit(values[i], { Connect: true, ViewChannel: true });
                                        await interaction.followUp({
                                            content: `<@${values[i]}> felhasználó **mostantól csatlakozhat** a csatornához!`,
                                        });
                                    };
                                };
                                permitUsermsg.delete();
                                userSelectCollector.stop();
                            } else {
                                return;
                            }
                        });
                    } else if (value === 'reject') {
                        const rejectUsermsg = await interaction.reply({
                            content: `A felhasználók kitiltásához válasszd ki őket ebből a legőrdülő menüből!`,
                            components: [new ActionRowBuilder().addComponents(userSelectMenu)],
                            ephemeral: true
                        });

                        const userSelectCollector = await rejectUsermsg.createMessageComponentCollector();
                        userSelectCollector.on('collect', async (interaction) => {
                            const values = interaction.values;
                            const targetMember = guild.members.cache.get(values[0]);

                            if (interaction.customId === 'userSelectMenu' && interaction.message.content === `A felhasználók kitiltásához válasszd ki őket ebből a legőrdülő menüből!`) {
                                await interaction.deferReply({ ephemeral: true });

                                if (!newVC.permissionsFor(values[0]).has('Connect') || !newVC.permissionsFor(values[0]).has('ViewChannel')) {
                                    await interaction.editReply({
                                        content: `<@${values[0]}> felhasználó **eddig se tudott csatlakozni** a csatornához!`
                                    });
                                } else {
                                    newVC.permissionOverwrites.edit(values[0], { Connect: false });
                                    if (targetMember.voice.channelId === newVC.id) {
                                        targetMember.voice.setChannel(null);
                                    };

                                    await interaction.editReply({
                                        content: `<@${values[0]}> felhasználó **mostantól nem tud csatlakozni** a csatornához!`
                                    });
                                };
                                for (let i = 1; i < values.length; i++) {
                                    if (newVC.permissionsFor(values[i]).has('Connect') || !newVC.permissionsFor(values[i]).has('ViewChannel')) {
                                        await interaction.followUp({
                                            content: `<@${values[i]}> felhasználó **eddig se tudott csatlakozni** a csatornához!`
                                        });
                                    } else {
                                        newVC.permissionOverwrites.edit(values[i], { Connect: false });
                                        if (targetMember.voice.channelId === newVC.id) {
                                            targetMember.voice.setChannel(null);
                                        };

                                        await interaction.followUp({
                                            content: `<@${values[i]}> felhasználó **mostantól nem tud csatlakozni** a csatornához!`,
                                        });
                                    };
                                };
                                rejectUsermsg.delete();
                                userSelectCollector.stop();
                            } else {
                                return;
                            }
                        });
                    } else if (value === 'invite') {
                        userSelectMenu.setMaxValues(1);
                        userSelectMenu.setPlaceholder(`Válassz ki egy felhasználót!`)
                        const inviteUsermsg = await interaction.reply({
                            content: `A felhasználó meghívásához válasszd ki ebből a legőrdülő menüből!`,
                            components: [new ActionRowBuilder().addComponents(userSelectMenu)]
                        });
                        
                        const userSelectCollector = await inviteUsermsg.createMessageComponentCollector();
                        userSelectCollector.on('collect', async (interaction) => {
                            if (interaction.customId === 'userSelectMenu' && interaction.message.content === `A felhasználó meghívásához válasszd ki ebből a legőrdülő menüből!`) {
                                const value = interaction.values[0];
                                await interaction.deferReply({ ephemeral: true });
                                try {
                                    client.users.fetch(value).then(target => {
                                        newVC.createInvite({ maxUses: 1 }).then(invite => {
                                            target.send({
                                                content: `${VCowner} meghívott téged a saját **${newVC.name}** nevezetű privát hangcsatornájához!\nhttps://discord.gg/${invite.code}`
                                            });
                                        })
                                    });
                                    newVC.permissionOverwrites.edit(value, { Connect: true, ViewChannel: true });
                                    await interaction.editReply({
                                        content: `<@${value}> felhasználó **sikeresen meg lett hívva** a csatornához!`,
                                        ephemeral: true
                                    });
                                } catch {
                                    await interaction.editReply({
                                        content: `**Nem sikerült <@${value}> felhasználót meghívni** a csatornához!`,
                                        ephemeral: true
                                    });
                                };
                                inviteUsermsg.delete();
                                userSelectCollector.stop();
                            } else {
                                return;
                            };
                        });
                    } else if (value === 'visibility') {
                        if (newVC.permissionsFor(everyoneId).has('ViewChannel')) {
                            await interaction.deferReply({ ephemeral: true });
                            newVC.permissionOverwrites.edit(everyoneId, { ViewChannel: false });
                            await interaction.editReply({
                                content: `A csatornát mostantól **senki sem** látja! Csak azok látják, akiknek van engedélye csatlakozni, illetve a jelenlévő tagok!`,
                                ephemeral: true
                            })
                        } else {
                            await interaction.deferReply({ ephemeral: true });
                            newVC.permissionOverwrites.edit(everyoneId, { ViewChannel: true });
                            await interaction.editReply({
                                content: `A csatornára mostantól **mindenki** látja!`,
                                ephemeral: true
                            })
                        }
                    }
                } else {
                    return;
                }
            });
        } else if (previousChannel && previousChannel.members.size !== 0 && previousChannel.parentId === tempVCcategoryId && previousChannel.id !== tempVCmakerChannelId) {
            if (member === VCowner) {
                const tempVCgetOwnership = client.buttons.get("getOwnership")

                const ownershipButtonmsg = await previousChannel.send({
                    components: [new ActionRowBuilder().addComponents(tempVCgetOwnership.ownershipButton)]
                });
                const collector = await ownershipButtonmsg.createMessageComponentCollector({ ComponentType: ComponentType.Button });
                collector.on('collect', async (interaction) => {
                    if(interaction.customId === 'tempVC-getOwnership') {
                        VCowner = interaction.member;
                        ownershipButtonmsg.delete();
                        ownershipButtonmsg.channel.send(`A csatorna tulajdonosa mostantól ${VCowner} !`);
                    }
                });
            }
        } else if (previousChannel && previousChannel.parentId === tempVCcategoryId && previousChannel.members.size === 0 && previousChannel.id !== tempVCmakerChannelId) {
            return previousChannel.delete();
        };
    },
};