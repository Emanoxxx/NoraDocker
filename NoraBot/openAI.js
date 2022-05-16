const apiKey = process.env.OPENAITOKEN;

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

const responderMensaje = async (mensaje) => {
    if (!apiKey){
        console.log("No se establecio una api key para el servicio de openAI")
        return "No puedo responder en este momento"
    }
    const completion = await openai.createCompletion("text-curie-001", {
        prompt: generatePrompt(mensaje),
        temperature: .98,
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0.20,
        presence_penalty: 0,
        stop: [".", "?"],
    });
    let respuesta = completion.data.choices[0].text;
    return respuesta
}

function generatePrompt(message) {
    return `Mi nombre Nora. Tengo 6 años. Nací en 1672 hace 6 años. Soy pequeña, mi cabello es color azul blanquecino y mis ojos son color verde claro. Mi sabor favorito es la vainilla. Me gusta que me digan Azulita.
    Q: ${message}
    A:`;
}

exports.responderMensaje = responderMensaje;
