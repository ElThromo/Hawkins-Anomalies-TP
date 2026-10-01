
const resolucionRepository = require("./resolucion.repository");

async function obtenerResoluciones(idReporte) {
    return await resolucionRepository.obtenerResoluciones(idReporte);
}

async function obtenerResolucionPorId(id) {
    return await resolucionRepository.obtenerResolucionPorId(id);
}

async function crearResolucion(datos, idUsuario) {
    return await resolucionRepository.crearResolucion({
        idReporte: datos.idReporte,
        resolucion: datos.resolucion,
        cuerpoResolucion: datos.cuerpoResolucion,
        idUsuario
    });
}

async function actualizarResolucion(id, datos) {
    return await resolucionRepository.actualizarResolucion(id, datos);
}

async function eliminarResolucion(id) {
    return await resolucionRepository.eliminarResolucion(id);
}

module.exports = {
    obtenerResoluciones,
    obtenerResolucionPorId,
    crearResolucion,
    actualizarResolucion,
    eliminarResolucion
};
