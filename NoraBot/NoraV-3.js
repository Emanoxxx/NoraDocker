const Discord = require('discord.js');
const dotenv = require('dotenv');
if(process.env.TOKEN===undefined){
    dotenv.config();
}
const client = new Discord.Client({ intents: ["GUILDS", Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_VOICE_STATES] })
const openAI =require("./openAI.js");
const { createAudioPlayer } = require('@discordjs/voice');
let player = createAudioPlayer()
var connection= null;
client.on("ready", ()=>{
    console.log("Hola soy Azulita!!!")
});
const SOUND_prefix = process.env.SOUND_PREFIX;
const COMAND_prefix = process.env.COMAND_PREFIX;

const reproduceSonido = require("./src/js/reproducirAudio");
const ejecutaComando = require("./src/js/comandos");

client.on("messageCreate",async (message)=>{
    //Evitar bucle
    if(message.author.bot) return;
    if(!message.content.startsWith(SOUND_prefix)&&!message.content.startsWith(COMAND_prefix)) {
        if((message.content.includes("Nora")||message.content.includes("nora")||message.content.includes("azulita")||message.content.includes("Azulita")) && (message.content.split(" ").length<25)){
            try {
                message.channel.send(await ejecutarIA(message.content));
            } catch (error) {
                console.error();
            }
        }
        //
        
    }else{
        //ReproduceSonido
        if(message.content.startsWith(SOUND_prefix)) {
            const commandBody = message.content.slice(SOUND_prefix.length);
            const command =  commandBody.toLocaleLowerCase();
            connection=reproduceSonido.ejecutar(command,message,connection);
        }
        if(message.content.startsWith(COMAND_prefix)) {
            
            const commandBody = message.content.slice(COMAND_prefix.length);
            const command =  commandBody.toLocaleLowerCase();
            
            ejecutaComando.ejecutar(command,message,COMAND_prefix,connection);
        }
    }
    
});
async function ejecutarIA(mensaje){
    return await openAI.responderMensaje(mensaje);
}
client.login(process.env.TOKEN);