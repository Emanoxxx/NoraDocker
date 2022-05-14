const { rejects } = require("assert");
const fs = require("fs");
const { resolve } = require("path");
const path = require("path");

const PATH = process.env.CARPETA_SONIDOS || "";
let rootFolder = path.join(path.resolve("."), PATH);

exports.saveFile = async  (file, carpeta) => {
    if (!fs.existsSync(rootFolder)) {
        fs.mkdirSync(rootFolder);
    }

    let filepath = path.join(path.resolve("."), PATH, carpeta);
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
    }
    // file.mv(path.join(filepath, file.name), (err) => {
    //     if (err) {
    //         console.log(err);
    //     }
    // });
    return await move(file, path.join(filepath, file.name));
};

function move(file, directorio) {
    return new Promise((resolve, reject) => {
        file.mv(directorio, (err) => {
            if (err) {
                reject(false)
                return;
            }
            resolve(true)
        });
    });
}

exports.deleteFolder = (carpeta) => {
    if (!fs.existsSync(rootFolder)) {
        return;
    }

    let filepath = path.join(path.resolve("."), PATH, carpeta);
    if (fs.existsSync(filepath)) {
        fs.rmSync(filepath, { recursive: true, force: true });
    }
};

exports.deleteFile = (carpeta, filename) => {
    if (!fs.existsSync(rootFolder)) {
        return;
    }

    let filepath = path.join(path.resolve("."), PATH, carpeta, filename);
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }
};
