const { VoiceConnectionStatus } = require('@discordjs/voice');
const { Message } = require('discord.js');
const ejecutar = (command,message,prefix,connection) => {
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
        if(command === "hola"){
            return saludar(message);
        }
        if(command === "h"||command === "help"){
            return help(message);
        }
        if(command === "salir"||command === "desconecta"||command === "sal"){
            return irse(message);
        }
        if(command === "ven"||command === "conectate"||command === "conectate"||command === "entra"){
            return entrar(message);
        }
    }


function enviarMensaje(message,mensaje){
    message.channel.send(mensaje);
}
function irse(message) {
        let canalvoz = message.guild.me.voice.channel;
        if(!canalvoz) {
            return message.channel.send('¡Necesito unirme a un canal de voz primero!.');
            
        } else {
            try {
                message.channel.send("Bye");
                connection.destroy();
                
            } catch(error){
                
            }

        }
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
                    m.edit('Ya llegue!!').catch(error => console.log(error));
                }).catch(error => console.log(error));
        };
}
function help(message) {
    var inicio ="```";
    var contenido ="Hola, Soy Nora <3 y te ayudare en lo que necesites.\n";
    contenido +="Primero te voy a explicar lo que puedo hacer.\n";
    contenido +=" \n \n";
    contenido +="Para reproducir cualquier sonido requieres escribir: *, por ejemplo *hola. \n";
    contenido +=" \n \n";
    contenido +="Para que ejecute algun comando requieres escribir: -, por ejemplo -salir. \n";
    contenido +=" \n \n";
    contenido +="Tambien puedo reproducir videos de youtube si escribes !p seguido del url del video <3";
    var fin ="```";
    return enviarMensaje(message,inicio+contenido+fin);
}
function saludar(message){
    var entero=getRandomInt(0,10);
    switch (entero) {
        case 0:
            return enviarMensaje(message,"Hola soy Azulita!!! :heart: ");
        case 1:
            return enviarMensaje(message,"Hola :heart: ");
        case 2:
            return enviarMensaje(message,"Hola soy Nora!!! :heart: ");
        case 3:
            return enviarMensaje(message,"Hola que tal!!! :heart: ");
        case 4:
            return enviarMensaje(message,"Hey que tal :heart: ");
        case 5:
            return enviarMensaje(message,"Hola me llamo Nora :heart: ");
        case 6:
            return enviarMensaje(message,"Hola soy Azulita!!! :heart: ");
        case 7:
            return enviarMensaje(message,"Hola :heart: ");
        case 8:
            return enviarMensaje(message,"Sip, soy Nora que necesitas :heart: ");
        case 9:
            return enviarMensaje(message,"Nora a tu sedvicio :heart: ");
        default:
            break;
    }
    
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
exports.ejecutar=ejecutar;