
const prisma = require("../prisma");

const incluirAutor = { usuario: { select: { idUsuario: true, nombre: true } } };

// OBTENER TODAS LAS RESOLUCIONES
async function obtenerResoluciones(idReporte) {
    return await prisma.resolucion.findMany({
        where: idReporte === undefined ? {} : { idReporte },
        include: incluirAutor,
        orderBy: [
            { fechaHora: "desc" },
            { idResolucion: "desc" }
        ]
    });
}

// OBTENER UNA RESOLUCIÓN POR ID
async function obtenerResolucionPorId(id) {
    return await prisma.resolucion.findUnique({
        where: { idResolucion: id },
        include: incluirAutor
    });
}

// CREAR UNA RESOLUCIÓN
async function crearResolucion(datos) {
    return await prisma.$transaction(async (tx) => {
        const resolucion = await tx.resolucion.create({
            data: {
                idReporte: datos.idReporte,
                idUsuario: datos.idUsuario,
                resolucion: datos.resolucion.trim(),
                cuerpoResolucion: datos.cuerpoResolucion.trim()
            },
            include: incluirAutor
        });

        await tx.reporte.update({
            where: { idReporte: datos.idReporte },
            data: { estado: "RESUELTO" }
        });

        return resolucion;
    });
}

// ACTUALIZAR UNA RESOLUCIÓN
async function actualizarResolucion(id, datos) {
    return await prisma.resolucion.update({
        where: { idResolucion: id },
        data: {
            resolucion: datos.resolucion.trim(),
            cuerpoResolucion: datos.cuerpoResolucion.trim()
        },
        include: incluirAutor
    });
}

// ELIMINAR UNA RESOLUCIÓN
async function eliminarResolucion(id) {
    return await prisma.$transaction(async (tx) => {
        const eliminada = await tx.resolucion.delete({
            where: { idResolucion: id }
        });

        await tx.reporte.updateMany({
            where: {
                idReporte: eliminada.idReporte,
                estado: "RESUELTO",
                resolucion: { is: null }
            },
            data: {
                estado: "EN_INVESTIGACION"
            }
        });

        const reporte = await tx.reporte.findUniqueOrThrow({
            where: { idReporte: eliminada.idReporte },
            select: {
                idReporte: true,
                estado: true
            }
        });

        return {
            idResolucion: eliminada.idResolucion,
            reporte
        };
    });
}

async function obtenerTopInvestigadores() {
    const ranking = await prisma.resolucion.groupBy({
        by: ["idUsuario"],
        where: {
            usuario: {
                is: {
                    rol: "INVESTIGADOR",
                    activo: true
                }
            },
            reporte: {
                is: { estado: "RESUELTO" }
            }
        },
        _count: { idResolucion: true },
        orderBy: [
            { _count: { idResolucion: "desc" } },
            { idUsuario: "asc" }
        ],
        take: 6
    });

    const ids = ranking
        .map((fila) => fila.idUsuario)
        .filter((id) => id !== null);

    if (ids.length === 0) return [];

    const investigadores = await prisma.usuario.findMany({
        where: {
            idUsuario: { in: ids },
            rol: "INVESTIGADOR",
            activo: true
        },
        select: {
            idUsuario: true,
            nombre: true,
            avatar: true
        }
    });

    return ranking.flatMap((fila) => {
        const investigador = investigadores.find(
            (usuario) => usuario.idUsuario === fila.idUsuario
        );

        if (!investigador) return [];

        return [{
            ...investigador,
            reportesResueltos: fila._count.idResolucion
        }];
    });
}

module.exports = {
    obtenerTopInvestigadores,
    obtenerResoluciones,
    obtenerResolucionPorId,
    crearResolucion,
    actualizarResolucion,
    eliminarResolucion
};
