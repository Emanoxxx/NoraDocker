const nodemailer = require("nodemailer");

const usuario = process.env.MAILER_USER || null;
const password = process.env.MAILER_PASSWORD || null;

let mailerConfig = {
    host: "smtp.ionos.mx",
    port: 587,
    secure: false,
    auth: {
        type: "login",
        user: usuario,
        pass: password,
    },
};

exports.sendEmail = (asunto, html, destinatario) => {
    let email = {
        from: usuario, //remitente
        to: destinatario, //destinatario
        subject: asunto, //asunto del correo
        html: html,
    };
    return new Promise((resolve, reject) => {
        let createTransport = nodemailer.createTransport(mailerConfig);

        createTransport.sendMail(email, function (error, info) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
            createTransport.close();
        });
    });
};
