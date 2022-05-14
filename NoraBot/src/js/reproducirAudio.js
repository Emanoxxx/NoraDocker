const axi = require('axios');
const fleSystem = require('fs');
const { createAudioPlayer } = require('@discordjs/voice');
var con= null;
let player = createAudioPlayer()
const ejecutar = (command,message,connection) => {
    
    var entero=getRandomInt(0,20);
    if (entero==1){
        var opcion=getRandomInt(0,10);
        switch (opcion) {
            case 0:
                return enviarMensaje(message,"Oye... no seas avadicioso");
            case 1:
                return enviarMensaje(message,"Ahodita no puedo...");
            case 2:
                return enviarMensaje(message,"Pada que quiedes eso...");
            case 3:
                return enviarMensaje(message,"No queyo ahoda...");
            case 4:
                return enviarMensaje(message,"Nop...");
            case 5:
                return enviarMensaje(message,"No queyo...");
            case 6:
                return enviarMensaje(message,"Mmm Nop...");
            case 7:
                return enviarMensaje(message,"Nop nop no...");
            case 8:
                return enviarMensaje(message,"Mmm nop jeje...");
            case 9:
                return enviarMensaje(message,"Jeje nop...");
            default:
                break;
        }
        
    }
    var solicitud="http://"+process.env.HOST+"/CategoriasDeSonido/search/Comando/"+command+"/"
    console.log(solicitud);
    try {
        axi.get(solicitud).then(function(response){
            var archivos=response.data.archivos;
            if (archivos.lenght==0) {
                    return sonidosNoEncontrados(message);
            }
            var entero=getRandomInt(0,archivos.length);
            var url="http://"+process.env.HOST+"/"+response.data.id+"/"+archivos[entero];
            console.log(url);
            playAudio(message,url,connection);
        }).catch(function(err){
            console.log(err.message);
            if(err.response.status){
                switch (err.response.status) {
                    case 404:
                        sonidosNoEncontrados(message);
                        break;
                    case 500:
                        enviarMensaje(message,"Tengo problemas con eso...:cold_sweat:");
                        break;
                    default:
                        break;
                }
                
            }
            return;
        });
    } catch (error) {
            console.error(error.message)
    }
}
function playAudio(message,url,connection) {
    try {
        console.log(url);
        const DiscordStream = require('@discordjs/voice');
        entrar(message);
        const join = require('./join');
        connection=join.getconexion(message);
        connection.subscribe(player);
            player.play(DiscordStream.createAudioResource(url));
        player.on(DiscordStream.AudioPlayerStatus.Idle, () => {})
        
    } catch (error) {
        console.error(error);
    }
    return con=connection;
}
function entrar(message) {
    let canalvoz = message.member.voice.channel;
        
        if(!canalvoz ) {
            message.channel.send('¡Necesitas unirte a un canal de voz primero!.');

        } else if (message.guild.voiceConnection) {
            message.channel.send('Lo siento... Estoy en otro lugar...');

        } else {
            try {
                if (connection.state.status=="ready"){return}
            } catch (error) {}
            message.channel.send('Voy...').then(m => {
                const join = require('./join');
                connection=join.getconexion(message)
                setConnection(connection);
                    m.edit('Ya llegue!!').catch(error => console.log(error));
                }).catch(error => console.log(error));
        };
}
function setConnection(connection) {
    con=connection;
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function fileExists(path) {
    try {
      if (fleSystem.existsSync(path)) {
          return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
}
function enviarMensaje(message,mensaje){
    message.channel.send(mensaje);
}
function sonidosNoEncontrados(message){
        var opcion=getRandomInt(0,10);
        switch (opcion) {
            case 0:
                return enviarMensaje(message,"Perdona, ese sonido no lo encuento...:cold_sweat:");
            case 1:
                return enviarMensaje(message,"Perdona... emm ese sonido no lo encuento...:cold_sweat:");
            case 2:
                return enviarMensaje(message,"Ese sonido no lo encuento :cold_sweat:");
            case 3:
                return enviarMensaje(message,":cold_sweat: ¡Oh no ese sonido no lo encontre!");
            case 4:
                return enviarMensaje(message,":disappointed_relieved: Este... no tengo ese sonido");
            case 5:
                return enviarMensaje(message,":disappointed_relieved: No puedo hacerlo... no encontre el sonido");
            case 6:
                return enviarMensaje(message,"Perdona, ese sonido no lo encuento...:cold_sweat:");
            case 7:
                return enviarMensaje(message,":disappointed_relieved: Esque... no tengo el sonido que me pediste...");
            case 8:
                return enviarMensaje(message,":sweat: Perdon... no lo tengo");
            case 9:
                return enviarMensaje(message,"Perdona, ese sonido no lo encuento...:sweat: ");
            default:
                break;
        }
}
exports.ejecutar=ejecutar;