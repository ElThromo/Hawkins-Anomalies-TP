
const prisma = require("../prisma");

// Config reutilizable: qué traer de las relaciones cada vez que se pide un reporte
const incluirRelaciones = {
    zona: {
        select: { idZona: true, nombre: true, nivelPeligro: true }
    },
    usuario: {
        select: { idUsuario: true, nombre: true } // nunca traer email ni contrasenaHash
    },
    categoria: {
        select: { idCategoria: true, nombre: true }
    },
    imagenes: true
};

// OBTENER TODOS LOS REPORTES
async function obtenerReportes() {
    return await prisma.reporte.findMany({
        include: incluirRelaciones,
        orderBy: { fechaHora: "desc" }
    });
}

// OBTENER UN REPORTE POR ID
async function obtenerReportePorId(id) {
    return await prisma.reporte.findUnique({
        where: { idReporte: id },
        include: incluirRelaciones
    });
}

// CREAR UN REPORTE
async function crearReporte(datos) {
    return await prisma.reporte.create({
        data: datos,
        include: incluirRelaciones
    });
}

// ACTUALIZAR UN REPORTE
async function actualizarReporte(id, datos) {
    return await prisma.reporte.update({
        where: { idReporte: id },
        data: datos,
        include: incluirRelaciones
    });
}

// ELIMINAR UN REPORTE
async function eliminarReporte(id) {
    return await prisma.reporte.delete({
        where: { idReporte: id }
    });
}

async function agregarImagenes(idReporte, urls) {
    return await prisma.$transaction(async (tx) => {
        const reportes = await tx.$queryRaw`
            SELECT idReporte
            FROM Reporte
            WHERE idReporte = ${idReporte}
            FOR UPDATE
        `;

        if (reportes.length === 0) {
            const error = new Error("Reporte no encontrado");
            error.code = "REPORTE_NO_ENCONTRADO";
            throw error;
        }

        const cantidadActual = await tx.imagenReporte.count({
            where: { idReporte }
        });

        if (cantidadActual + urls.length > 5) {
            const disponibles = Math.max(0, 5 - cantidadActual);
            const error = new Error(
                `El reporte admite hasta 5 imágenes en total. Podés agregar ${disponibles} más.`
            );
            error.code = "LIMITE_IMAGENES";
            throw error;
        }

        return await tx.imagenReporte.createMany({
            data: urls.map((url) => ({ idReporte, url }))
        });
    });
}

module.exports = {
    obtenerReportes,
    obtenerReportePorId,
    crearReporte,
    actualizarReporte,
    eliminarReporte,
    agregarImagenes
};
