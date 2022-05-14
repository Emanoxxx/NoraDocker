async function main() {
    const {PrismaClient} = require('@prisma/client')
    const prisma = new PrismaClient()
    var usuario=await prisma.usuario.create({data: {
        nombre:"nombre",
        password:"123456",
        username:"usuario",
        email:"email@email.com",
        isAdmin:true,
        isActive:true
    }}).catch(function(err) {
        console.error(err)
    })
    console.log(usuario)
}
try {
main()
}catch(err) {
}