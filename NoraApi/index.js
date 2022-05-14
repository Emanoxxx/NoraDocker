const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { ensureAuthenticated } = require("./controllers/checkToken");
const { createToken } = require("./controllers/create-token");
const fileUpload = require("express-fileupload");
const { sendEmail } = require("./controllers/mailer");

const {
    saveFile,
    deleteFolder,
    deleteFile,
} = require("./controllers/FileManager");
const path = require("path");
const { status } = require("express/lib/response");

const PATH = process.env.CARPETA_SONIDOS || "";
let rootFolder = path.join(path.resolve("."), PATH);

const prisma = new PrismaClient();

const app = express();

app.use(express.static(rootFolder));
app.use(express.static(path.join(path.resolve("."), "res")));

app.use(express.json());
app.use(fileUpload());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({
        message: "ok",
    });
});

app.post("/login/", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        res.status(500).json({
            error: "Parámetros incompletos. Se requieren: { username, password }",
        });
        return;
    }
    try {
        const usuario = await prisma.usuario.findUnique({
            where: {
                username,
            },
        });

        if (usuario?.password == password) {
            res.json({
                ...usuario,
                token: createToken(usuario?.username),
            });
        } else {
            res.status(404).json({
                error: "Credenciales incorrectas",
            });
        }
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.get("/Usuarios/", ensureAuthenticated, async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                password: false,
                username: true,
                id: true,
                isActive: true,
                email: true,
                isAdmin: true,
                nombre: true,
            },
            orderBy: {
                username: "asc"
            }
        });
        res.json(usuarios);
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.post("/Usuarios/", ensureAuthenticated, async (req, res) => {
    var { username, password, isAdmin, isActive, email, nombre } = req.body;

    if (!username || !password || !nombre || !email) {
        res.status(500).json({
            error: "Parámetros incompletos. Se requieren: { username, password, nombre, email }",
        });
        return;
    }
    if (isAdmin == undefined) {
        isAdmin = false;
    }
    if (isActive == undefined) {
        isActive = false;
    }

    try {
        const result = await prisma.usuario.create({
            data: {
                username,
                password,
                isAdmin,
                isActive,
                nombre,
                email,
            },
        });
        res.json(result);
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.post("/Usuarios/registrar", async (req, res) => {
    var { username, password, email, nombre } = req.body;

    if (!username || !password || !nombre || !email) {
        res.status(500).json({
            error: "Parámetros incompletos. Se requieren: { username, password, nombre, email }",
        });
        return;
    }

    try {
        const result = await prisma.usuario.create({
            data: {
                username,
                password,
                nombre,
                email,
            },
        });
        res.json(result);
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.delete("/Usuarios/:id", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    if (!id) {
        res.status(500).json({
            error: "Parámetros incompletos. Se requieren: { id }",
        });
        return;
    }

    try {
        const result = await prisma.usuario.delete({
            where: {
                id,
            },
        });
        res.json(result);
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.put("/Usuarios/:actualUsername/", ensureAuthenticated, async (req, res) => {
    var { username, password, isAdmin, isActive } = req.body;
    const { actualUsername } = req.params;

    if (!actualUsername) {
        res.status(500).json({
            error: "Parámetros incompletos. Se requieren: /{{actualUsername}}",
        });
        return;
    }

    if (
        !username &&
        !password &&
        isAdmin == undefined &&
        isActive == undefined
    ) {
        res.status(500).json({ error: "No hay parametros que actualizar" });
        return;
    }

    try {
        const usuario = await prisma.usuario.findUnique({
            where: {
                username: actualUsername,
            },
        });

        if (!usuario) {
            res.status(404).json({
                error: `No se encontró al usuario ${actualUsername}`,
            });
            return;
        }

        if (isAdmin == undefined) {
            isAdmin = usuario.isAdmin;
        }
        if (isActive == undefined) {
            isActive = usuario.isActive;
        }
        if (!username) {
            username = usuario.username;
        }
        if (!password) {
            password = usuario.password;
        }
        const result = await prisma.usuario.update({
            where: {
                id: usuario.id,
            },
            data: {
                username,
                password,
                isAdmin,
                isActive,
            },
        });
        res.json(result);
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.put(
    "/Usuarios/:username/activar/",
    ensureAuthenticated,
    async (req, res) => {
        const { username } = req.params;

        if (!username) {
            res.status(500).json({
                error: "Parámetros incompletos. Se requieren: /{{username}}",
            });
            return;
        }

        try {
            const usuario = await prisma.usuario.findUnique({
                where: {
                    username,
                },
            });

            if (!usuario) {
                res.status(404).json({
                    error: `No se encontró al usuario ${username}`,
                });
                return;
            }

            if (usuario.isActive) {
                res.json(usuario);
                return;
            }
            const result = await prisma.usuario.update({
                where: {
                    id: usuario.id,
                },
                data: {
                    isActive: true,
                },
            });
            html = `<style>
            :root {
                --primary: #D6E2FF;
                --on-primary: #4E4E53;
            }
            .mail {
                width: 100%;
                height: 100%;
                font-family:sans-serif;
                color: var(--on-primary);
            }
        
            .header {
                background: var(--primary);
                padding: 5px 10px;
                border-radius: 5px;
                color: var(--on-primary);
            }
        
            .logo {
                width: 100px;
                margin-left: auto;
                margin-right: auto;
                margin-top: 10px;
            }
            .main {
                padding: 20px;
                display: flex;
                flex-direction: column;
            }
            .text-center {
                text-align: center;
                margin-top: auto;
                position: relative;
            }
        </style>
        
        <body>
            <div class="mail">
                <div class="header">
                    <h1 class="app-name">Nora Sounds</h1>
                </div>
                <div class="main">
                    <img class="logo" src="http://home.alethetwin.online:8080/img/logo.png" alt="">
                    <h2>¡Hola ${usuario.nombre}!</h2>
                    <p>Lo saluda el equipo de administradores de Nora Sounds!</p>
                    <p>Ahora puede acceder a la aplicación con su usuario y contraseña.</p>
                    <small class="text-center">Este es un email autogenerado<small>
                </div>
            </div>
        </body>`;

            sendEmail("Su cuenta ha sido activada", html, usuario.email)
                .then(() => {
                    console.log("enviado");
                })
                .catch((error) => {
                    console.log(error);
                });
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.put(
    "/Usuarios/:username/toAdmin/",
    ensureAuthenticated,
    async (req, res) => {
        const { username } = req.params;

        if (!username) {
            res.status(500).json({
                error: "Parámetros incompletos. Se requieren: /{{username}}",
            });
            return;
        }

        try {
            const usuario = await prisma.usuario.findUnique({
                where: {
                    username,
                },
            });

            if (!usuario) {
                res.status(404).json({
                    error: `No se encontró al usuario ${username}`,
                });
                return;
            }

            if (usuario.isAdmin) {
                res.status(500).json({
                    error: `El usuario ${usuario.username} ya es administrador`
                })
                return;
            }
            const result = await prisma.usuario.update({
                where: {
                    id: usuario.id,
                },
                data: {
                    isAdmin: true,
                },
            });
            html = `<style>
            :root {
                --primary: #D6E2FF;
                --on-primary: #4E4E53;
            }
            .mail {
                width: 100%;
                height: 100%;
                font-family:sans-serif;
                color: var(--on-primary);
            }
        
            .header {
                background: var(--primary);
                padding: 5px 10px;
                border-radius: 5px;
                color: var(--on-primary);
            }
        
            .logo {
                width: 100px;
                margin-left: auto;
                margin-right: auto;
                margin-top: 10px;
            }
            .main {
                padding: 20px;
                display: flex;
                flex-direction: column;
            }
            .text-center {
                text-align: center;
                margin-top: auto;
                position: relative;
            }
        </style>
        
        <body>
            <div class="mail">
                <div class="header">
                    <h1 class="app-name">Nora Sounds</h1>
                </div>
                <div class="main">
                    <img class="logo" src="http://home.alethetwin.online:8080/img/logo.png" alt="">
                    <h2>¡Hola ${usuario.nombre}!</h2>
                    <p>Lo saluda el equipo de administradores de Nora Sounds!</p>
                    <p>Ahora formas parte del equipo de administradores.</p>
                    <p>Para más información, responde a ese correo con tus dudas.</p>
                    <small class="text-center">Este es un email autogenerado<small>
                </div>
            </div>
        </body>`;

            sendEmail("Su cuenta ha sido elevada", html, usuario.email)
                .then(() => {
                    console.log("enviado");
                })
                .catch((error) => {
                    console.log(error);
                });
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.put(
    "/Usuarios/:username/toUser/",
    ensureAuthenticated,
    async (req, res) => {
        const { username } = req.params;

        if (!username) {
            res.status(500).json({
                error: "Parámetros incompletos. Se requieren: /{{username}}",
            });
            return;
        }

        try {
            const usuario = await prisma.usuario.findUnique({
                where: {
                    username,
                },
            });

            if (!usuario) {
                res.status(404).json({
                    error: `No se encontró al usuario ${username}`,
                });
                return;
            }

            if (!usuario.isAdmin) {
                res.status(500).json({
                    error: `El usuario ${usuario.username} no es Administrador`
                })
                return;
            }
            const result = await prisma.usuario.update({
                where: {
                    id: usuario.id,
                },
                data: {
                    isAdmin: false,
                },
            });
            html = `<style>
            :root {
                --primary: #D6E2FF;
                --on-primary: #4E4E53;
            }
            .mail {
                width: 100%;
                height: 100%;
                font-family:sans-serif;
                color: var(--on-primary);
            }
        
            .header {
                background: var(--primary);
                padding: 5px 10px;
                border-radius: 5px;
                color: var(--on-primary);
            }
        
            .logo {
                width: 100px;
                margin-left: auto;
                margin-right: auto;
                margin-top: 10px;
            }
            .main {
                padding: 20px;
                display: flex;
                flex-direction: column;
            }
            .text-center {
                text-align: center;
                margin-top: auto;
                position: relative;
            }
        </style>
        
        <body>
            <div class="mail">
                <div class="header">
                    <h1 class="app-name">Nora Sounds</h1>
                </div>
                <div class="main">
                    <img class="logo" src="http://home.alethetwin.online:8080/img/logo.png" alt="">
                    <h2>¡Hola ${usuario.nombre}!</h2>
                    <p>Lo saluda el equipo de administradores de Nora Sounds!</p>
                    <p>Has sido destituido del equipo de administradores.</p>
                    <p>Para más información, responde a ese correo con tus dudas.</p>
                    <small class="text-center">Este es un email autogenerado<small>
                </div>
            </div>
        </body>`;

            sendEmail("Su cuenta ha sido degradada", html, usuario.email)
                .then(() => {
                    console.log("enviado");
                })
                .catch((error) => {
                    console.log(error);
                });
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.put(
    "/Usuarios/:username/activar/",
    ensureAuthenticated,
    async (req, res) => {
        const { username } = req.params;

        if (!username) {
            res.status(500).json({
                error: "Parámetros incompletos. Se requieren: /{{username}}",
            });
            return;
        }

        try {
            const usuario = await prisma.usuario.findUnique({
                where: {
                    username,
                },
            });

            if (!usuario) {
                res.status(404).json({
                    error: `No se encontró al usuario ${username}`,
                });
                return;
            }

            if (usuario.isActive) {
                res.json(usuario);
                return;
            }
            const result = await prisma.usuario.update({
                where: {
                    id: usuario.id,
                },
                data: {
                    isActive: true,
                },
            });
            html = `<style>
            :root {
                --primary: #D6E2FF;
                --on-primary: #4E4E53;
            }
            .mail {
                width: 100%;
                height: 100%;
                font-family:sans-serif;
                color: var(--on-primary);
            }
        
            .header {
                background: var(--primary);
                padding: 5px 10px;
                border-radius: 5px;
                color: var(--on-primary);
            }
        
            .logo {
                width: 100px;
                margin-left: auto;
                margin-right: auto;
                margin-top: 10px;
            }
            .main {
                padding: 20px;
                display: flex;
                flex-direction: column;
            }
            .text-center {
                text-align: center;
                margin-top: auto;
                position: relative;
            }
        </style>
        
        <body>
            <div class="mail">
                <div class="header">
                    <h1 class="app-name">Nora Sounds</h1>
                </div>
                <div class="main">
                    <img class="logo" src="http://home.alethetwin.online:8080/img/logo.png" alt="">
                    <h2>¡Hola ${usuario.nombre}!</h2>
                    <p>Lo saluda el equipo de administradores de Nora Sounds!</p>
                    <p>Ahora puede acceder a la aplicación con su usuario y contraseña.</p>
                    <small class="text-center">Este es un email autogenerado<small>
                </div>
            </div>
        </body>`;

            sendEmail("Su cuenta ha sido activada", html, usuario.email)
                .then(() => {
                    console.log("enviado");
                })
                .catch((error) => {
                    console.log(error);
                });
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.put(
    "/Usuarios/:username/desactivar/",
    ensureAuthenticated,
    async (req, res) => {
        const { username } = req.params;

        if (!username) {
            res.status(500).json({
                error: "Parámetros incompletos. Se requieren: /{{username}}",
            });
            return;
        }

        try {
            const usuario = await prisma.usuario.findUnique({
                where: {
                    username,
                },
            });

            if (!usuario) {
                res.status(404).json({
                    error: `No se encontró al usuario ${username}`,
                });
                return;
            }

            if (!usuario.isActive) {
                res.status(500).json({
                    error: 'El usuario ya se encuentra desactivado'
                });
                return;
            }

            const result = await prisma.usuario.update({
                where: {
                    id: usuario.id,
                },
                data: {
                    isActive: false,
                },
            });
            html = `<style>
            :root {
                --primary: #D6E2FF;
                --on-primary: #4E4E53;
            }
            .mail {
                width: 100%;
                height: 100%;
                font-family:sans-serif;
                color: var(--on-primary);
            }
        
            .header {
                background: var(--primary);
                padding: 5px 10px;
                border-radius: 5px;
                color: var(--on-primary);
            }
        
            .logo {
                width: 100px;
                margin-left: auto;
                margin-right: auto;
                margin-top: 10px;
            }
            .main {
                padding: 20px;
                display: flex;
                flex-direction: column;
            }
            .text-center {
                text-align: center;
                margin-top: auto;
                position: relative;
            }
        </style>
        
        <body>
            <div class="mail">
                <div class="header">
                    <h1 class="app-name">Nora Sounds</h1>
                </div>
                <div class="main">
                    <img class="logo" src="http://home.alethetwin.online:8080/img/logo.png" alt="">
                    <h2>¡Hola ${usuario.nombre}!</h2>
                    <p>Lo saluda el equipo de administradores de Nora Sounds!</p>
                    <p>Tu cuenta ha sido desactivada.</p>
                    <p>Para más información responde a este correo con tus dudas.</p>
                    <small class="text-center">Este es un email autogenerado<small>
                </div>
            </div>
        </body>`;

            sendEmail("Su cuenta ha sido desactivada", html, usuario.email)
                .then(() => {
                    console.log("enviado");
                })
                .catch((error) => {
                    console.log(error);
                });
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.get("/CategoriasDeSonido/", ensureAuthenticated, async (req, res) => {
    try {
        const categoriasDeSonido = await prisma.categoriaDeSonido.findMany();
        res.json(categoriasDeSonido);
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.get(
    "/CategoriasDeSonido/search/:query/",
    ensureAuthenticated,
    async (req, res) => {
        var { query } = req.params;
        console.log(query);
        if (!query) {
            // res.status(500).json({
            //     error: "Parámetros incompletos. Se requieren: /{query}",
            // });
            // return;
            try {
                const result = await prisma.categoriaDeSonido.findMany({
                    orderBy: {
                        nombre: "asc",
                    },
                });

                res.json(result);
            } catch (e) {
                dbError(e, res);
                return;
            }
        }
        query = `%${query}%`;
        try {
            const result =
                await prisma.$queryRawUnsafe`SELECT * FROM "CategoriaDeSonido" WHERE nombre like ${query};`;
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.get(
    "/CategoriasDeSonido/search/",
    ensureAuthenticated,
    async (req, res) => {
        try {
            const result = await prisma.categoriaDeSonido.findMany();
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.get("/CategoriasDeSonido/:id/", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    if (!id) {
        res.status(500).json({
            error: "Parámetros incompletos. Se requieren: /{id}",
        });
        return;
    }

    try {
        const categoriasDeSonido = await prisma.categoriaDeSonido.findUnique({
            where: { id },
        });
        res.json(categoriasDeSonido);
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.post("/CategoriasDeSonido/", ensureAuthenticated, async (req, res) => {
    const { nombre } = req.body;
    var { comandos } = req.body;

    if (!nombre) {
        res.status(500).json({
            error: "Parámetros incompletos. Se requieren: body: { nombre }",
        });
        return;
    }
    if (!comandos) {
        comandos = [];
    }
    try {
        const categoriasDeSonido = await prisma.categoriaDeSonido.create({
            data: {
                nombre: nombre.toLowerCase(),
                comandos,
            },
        });

        res.status(201).json(categoriasDeSonido);
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.put("/CategoriasDeSonido/:id/", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    if (!id) {
        res.status(500).json({
            error: "Parámetros incompletos. Se requieren: /{id}",
        });
        return;
    }

    try {
        const categoriasDeSonido = await prisma.categoriaDeSonido.findUnique({
            where: { id },
        });

        const nombre = req.body.nombre || categoriasDeSonido?.nombre;
        const comandos = req.body.comandos || categoriasDeSonido?.comandos;

        const result = await prisma.categoriaDeSonido.update({
            data: {
                nombre,
                comandos,
            },
            where: {
                id,
            },
        });

        res.status(201).json(result);
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.post(
    "/CategoriasDeSonido/:idCategoriaDeSonido/Archivo/",
    ensureAuthenticated,
    async (req, res) => {
        const { idCategoriaDeSonido } = req.params;
        const { files } = req;

        if (!idCategoriaDeSonido || !files) {
            res.status(500).json({
                error: "Parámetros incompletos. Se requieren: /{idCategoriaDeSonido}, body:  { files }",
            });
            return;
        }

        try {
            const categoriaDeSonido = await prisma.categoriaDeSonido.findUnique(
                {
                    where: {
                        id: idCategoriaDeSonido,
                    },
                }
            );

            if (!categoriaDeSonido) {
                res.status(404).json({
                    error: `Categoría de Sonido con id ${idCategoriaDeSonido} no encontrada.`,
                });
                return;
            }

            for (let i = 0; i < Object.keys(files).length; i++) {
                let archivo = Object.keys(files)[i];

                if (!categoriaDeSonido.archivos.includes(files[archivo].name)) {
                    let result = await saveFile(
                        files[archivo],
                        categoriaDeSonido.id
                    );
                    if (result) {
                        categoriaDeSonido.archivos.push(files[archivo].name);
                    }
                } else {
                    res.status(500).json({
                        error: `El archivo ${files[archivo].name} ya existe.`,
                        code: "P2002",
                    });
                    return;
                }
            }

            const result = await prisma.categoriaDeSonido.update({
                data: {
                    archivos: categoriaDeSonido.archivos,
                },
                where: {
                    id: idCategoriaDeSonido,
                },
            });

            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.delete(
    "/CategoriasDeSonido/:id/",
    ensureAuthenticated,
    async (req, res) => {
        const { id } = req.params;
        try {
            const result = await prisma.categoriaDeSonido.delete({
                where: {
                    id,
                },
            });

            if (result) {
                deleteFolder(id);
            }
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.delete(
    "/CategoriasDeSonido/:idCategoriaDeSonido/Archivo/:nombre/",
    ensureAuthenticated,
    async (req, res) => {
        const { idCategoriaDeSonido, nombre } = req.params;

        if (!idCategoriaDeSonido || !nombre) {
            res.status(500).json({
                error: "Parámetros incompletos. Se requieren: /{idCategoriaDeSonido}/Archivo/{nombre}/",
            });
            return;
        }
        try {
            const categoriaDeSonido = await prisma.categoriaDeSonido.findUnique(
                {
                    where: {
                        id: idCategoriaDeSonido,
                    },
                }
            );

            if (!categoriaDeSonido) {
                res.status(404).json({
                    message: `Categoría de Sonido con id ${idCategoriaDeSonido} no encontrada.`,
                });
                return;
            }

            const archivos = categoriaDeSonido.archivos.filter(
                (archivo) => archivo != nombre
            );
            deleteFile(idCategoriaDeSonido, nombre);

            const result = await prisma.categoriaDeSonido.update({
                data: {
                    archivos,
                },
                where: {
                    id: idCategoriaDeSonido,
                },
            });
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.get("/CategoriasDeSonido/search/Comando/:comando/", async (req, res) => {
    const { comando } = req.params;

    if (!comando) {
        res.status(500).json({
            error: "Parámetros incompletos. Se requieren: /{comando}",
        });
        return;
    }
    try {
        const result =
            await prisma.$queryRawUnsafe`SELECT * FROM "CategoriaDeSonido" WHERE ${comando}=ANY(comandos);`;

        if (result.length == 0) {
            res.status(404).json({
                error: `No se encontró ninguna categoria coon comando ${comando}.`,
            });
            return;
        }

        res.json(result[0]);
    } catch (e) {
        dbError(e, res);
        return;
    }
});

app.put(
    "/CategoriasDeSonido/:idCategoriaDeSonido/Comando/:comandoActual/",
    async (req, res) => {
        const { idCategoriaDeSonido, comandoActual } = req.params;
        var { comando } = req.body;
        comando=comando.toLowerCase()
        
        if (!idCategoriaDeSonido || !comando || !comandoActual) {
            res.status(500).json({
                error: "Parámetros incompletos. Se requieren: /{idCategoriaDeSonido/Comando/{comandoActual}}, body { comando } ",
            });
            return;
        }
        try {
            const categoriaDeSonido = await prisma.categoriaDeSonido.findUnique(
                {
                    where: {
                        id: idCategoriaDeSonido,
                    },
                }
            );

            if (!categoriaDeSonido) {
                res.status(404).json({
                    message: `Categoría de Sonido con id ${idCategoriaDeSonido} no encontrada.`,
                });
                return;
            }

            let index = categoriaDeSonido.comandos.indexOf(comandoActual);
            if (index == -1) {
                res.status(500).json({
                    error: `No existe el comando ${comandoActual} en la categoría de sonido ${categoriaDeSonido.nombre}`,
                });
                return;
            }

            const checkResult =
                await prisma.$queryRawUnsafe`SELECT * FROM "CategoriaDeSonido" WHERE ${comando}=ANY(comandos);`;
            if (checkResult.length > 0) {
                res.status(500).json({
                    error: `El comando ${comando} ya se encuentra registrado.`,
                    code: "P2002",
                });
                return;
            }

            categoriaDeSonido.comandos[index] = comando;

            const result = await prisma.categoriaDeSonido.update({
                where: {
                    id: categoriaDeSonido.id,
                },
                data: {
                    comandos: categoriaDeSonido.comandos,
                },
            });
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.post(
    "/CategoriasDeSonido/:idCategoriaDeSonido/Comando/",
    async (req, res) => {
        const { idCategoriaDeSonido } = req.params;
        var { comando } = req.body;
        comando=comando.toLowerCase()

        if (!idCategoriaDeSonido || !comando) {
            res.status(500).json({
                error: "Parámetros incompletos. Se requieren: /{idCategoriaDeSonido}, body { comando } ",
            });
            return;
        }
        try {
            const categoriaDeSonido = await prisma.categoriaDeSonido.findUnique(
                {
                    where: {
                        id: idCategoriaDeSonido,
                    },
                }
            );

            if (!categoriaDeSonido) {
                res.status(404).json({
                    message: `Categoría de Sonido con id ${idCategoriaDeSonido} no encontrada.`,
                });
                return;
            }

            const checkResult =
                await prisma.$queryRawUnsafe`SELECT * FROM "CategoriaDeSonido" WHERE ${comando}=ANY(comandos);`;
            if (checkResult.length > 0) {
                res.status(500).json({
                    error: `Ya existe el comando ${comando}`,
                    code: "P2002",
                });
                return;
            }

            categoriaDeSonido.comandos.push(comando);

            const result = await prisma.categoriaDeSonido.update({
                where: {
                    id: categoriaDeSonido.id,
                },
                data: {
                    comandos: categoriaDeSonido.comandos,
                },
            });
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

app.delete(
    "/CategoriasDeSonido/:idCategoriaDeSonido/Comando/:comando",
    async (req, res) => {
        const { idCategoriaDeSonido, comando } = req.params;
        if (!idCategoriaDeSonido || !comando) {
            res.status(500).json({
                error: "Parámetros incompletos. Se requieren: /{idCategoriaDeSonido}/Comando/{comando}",
            });
            return;
        }

        try {
            const categoriaDeSonido = await prisma.categoriaDeSonido.findUnique(
                {
                    where: {
                        id: idCategoriaDeSonido,
                    },
                }
            );

            if (!categoriaDeSonido) {
                res.status(404).json({
                    message: `Categoría de Sonido con id ${idCategoriaDeSonido} no encontrada.`,
                });
                return;
            }

            let deleted = false;

            const comandos = categoriaDeSonido.comandos.filter(
                (comandoSaved) => {
                    if (comandoSaved == comando) {
                        deleted = true;
                    }
                    return comandoSaved != comando;
                }
            );
            if (!deleted) {
                res.status(404).json({ error: "Comando no existente" });
                return;
            }

            const result = await prisma.categoriaDeSonido.update({
                where: {
                    id: categoriaDeSonido.id,
                },
                data: {
                    comandos,
                },
            });
            res.json(result);
        } catch (e) {
            dbError(e, res);
            return;
        }
    }
);

const server = app.listen(PORT, () => {
    console.log(`NORA API listening on port ${PORT}, http://localhost:${PORT}`);
});

function dbError(e, res) {
    console.log(e);
    switch (e.code) {
        case "P1000":
            res.status(500).json({
                error: "Error de autenticación con la base de datos",
                code: e.code,
            });
            break;

        case "P1010":
            res.status(500).json({
                error: `Acceso denegado para el usuario ${e.database_user} a la base de datos {e.database_name}`,
                code: e.code,
            });
            break;

        case "P2002":
            res.status(500).json({
                error: `Restricción de unicidad violada en ${e.constraint}.`,
                code: e.code,
            });
            break;

        case undefined:
            res.status(500).json({
                error: `Error desconocido`,
                code: "0",
            });
            break;

        default:
            res.status(500).json({
                error: `Unhandled error. See https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes for more info.`,
                ...e,
            });
    }
}
