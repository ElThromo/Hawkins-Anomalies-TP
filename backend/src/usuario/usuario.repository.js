
const prisma = require("../prisma");

const camposSeguros = {
    idUsuario: true,
    nombre: true,
    email: true,
    rol: true,
    activo: true,
    fechaCreado: true,
    avatar: true
};

async function obtenerUsuarios() {
    return await prisma.usuario.findMany({ select: camposSeguros });
}

async function obtenerUsuarioPorId(id) {
    return await prisma.usuario.findUnique({
        where: { idUsuario: id },
        select: camposSeguros
    });
}

async function obtenerUsuarioPorEmail(email) {
    return await prisma.usuario.findUnique({
        where: { email }
    });
}

async function crearUsuario(datos) {
    return await prisma.usuario.create({
        data: datos,
        select: camposSeguros
    });
}

async function actualizarUsuario(id, datos) {
    return await prisma.usuario.update({
        where: { idUsuario: id },
        data: datos,
        select: camposSeguros
    });
}

async function eliminarUsuario(id) {
    return await prisma.usuario.delete({
        where: { idUsuario: id }
    });
}

async function obtenerTopContribuyentes() {
    const usuarios = await prisma.usuario.findMany({
        where: {
            activo: true,
            reportes: { some: {} }
        },
        select: {
            idUsuario: true,
            nombre: true,
            avatar: true,
            _count: {
                select: { reportes: true }
            }
        },
        orderBy: [
            { reportes: { _count: "desc" } },
            { idUsuario: "asc" }
        ],
        take: 6
    });

    return usuarios.map((usuario) => ({
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        avatar: usuario.avatar,
        reportesCreados: usuario._count.reportes
    }));
}

module.exports = {
    obtenerUsuarios,
    obtenerTopContribuyentes,
    obtenerUsuarioPorId,
    obtenerUsuarioPorEmail,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};
