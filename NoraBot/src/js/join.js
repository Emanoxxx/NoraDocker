const { joinVoiceChannel } = require('@discordjs/voice');
const getconexion = (message) => {
    const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
    });
    return connection;
}

exports.getconexion=getconexion;