const { YOUTUBEAPIKEY } = process.env;
const connection = require('../../connectToDB');
const fetch = require('node-fetch');

module.exports = (client) => {
    client.checkVideo = async () => {
        connection.query(`SELECT youtubeUserId, youtubeChannelId, youtubeMessage, JSON_EXTRACT(youtubeLastVideoId, '$[0]') AS youtubeLastVideoId1, JSON_EXTRACT(youtubeLastVideoId, '$[1]') AS youtubeLastVideoId2 FROM GuildNotifiers WHERE youtubeUserId IS NOT NULL`, async function(error, result) {
            if (error) throw error;

            const youtubeUserInfo = result;

            connection.query(`SELECT COUNT(youtubeUserId) AS youtubeUserIdCount FROM GuildNotifiers WHERE youtubeUserId IS NOT NULL`, async function(error, result) {
                if (error) throw error;

                const youtubeUserIdCount = result[0].youtubeUserIdCount;

                for (let i = 0; i < youtubeUserIdCount; i++) {
                    const userId = youtubeUserInfo[i].youtubeUserId;
                    const channelId = youtubeUserInfo[i].youtubeChannelId;
                    const lastVideoId1 = youtubeUserInfo[i].youtubeLastVideoId1.slice(1, -1);
                    const lastVideoId2 = youtubeUserInfo[i].youtubeLastVideoId2.slice(1, -1);
                    await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${userId}&maxResults=2&order=date&key=${YOUTUBEAPIKEY}`)
                    .then(response => response.json())
                    .then(response => {
                        if (response.items[0].id.kind !== "youtube#video") return;

                        const currentLastVideoId1 = response.items[0].id.videoId;
                        const currentLastVideoId2 = response.items[1].id.videoId;

                        if (currentLastVideoId1 !== lastVideoId1 && currentLastVideoId1 !== lastVideoId2) {
                            let message = youtubeUserInfo[i].youtubeMessage;
                            if (message === null) message = `@everyone\n**${response.items[0].snippet.channelTitle}** új videót tett ki!`;

                            client.channels.fetch(channelId).then(channel =>
                                channel.send(`${message}\n\nhttps://www.youtube.com/watch?v=${currentLastVideoId1}`)
                            ).catch(console.error);

                            connection.query(`UPDATE GuildNotifiers SET youtubeLastVideoId = JSON_SET(youtubeLastVideoId, '$[0]', '${currentLastVideoId1}'), youtubeLastVideoId = JSON_SET(youtubeLastVideoId, '$[1]', '${currentLastVideoId2}') WHERE youtubeUserId = '${youtubeUserInfo[i].youtubeUserId}'`);
                        } else if (currentLastVideoId1 === lastVideoId2) {
                            connection.query(`UPDATE GuildNotifiers SET youtubeLastVideoId = JSON_SET(youtubeLastVideoId, '$[0]', '${currentLastVideoId1}'), youtubeLastVideoId = JSON_SET(youtubeLastVideoId, '$[1]', '${currentLastVideoId2}') WHERE youtubeUserId = '${youtubeUserInfo[i].youtubeUserId}'`);
                        };
                    })
                    .catch(console.error);
                };
            });
        });
    }
}