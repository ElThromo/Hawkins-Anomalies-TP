
const LIMITES_TEXTO = { titulo: 200, cuerpo: 2500 };
const ESTADOS_VALIDOS = ["NO_VERIFICADO", "EN_INVESTIGACION", "RESUELTO"];

function validarTextos(datos, parcial) {
    for (const [campo, limite] of Object.entries(LIMITES_TEXTO)) {
        if (parcial && !Object.hasOwn(datos, campo)) continue;

        const valor = datos[campo];
        const nombre = campo === "titulo" ? "El título" : "La descripción";
        if (typeof valor !== "string") return `${nombre} debe ser texto`;
        if (!valor.trim()) return `${nombre} no puede quedar ${campo === "titulo" ? "vacío" : "vacía"} ni contener solo espacios`;
        if (valor.length > limite) return `${nombre} admite hasta ${limite} caracteres`;
    }
    return null;
}

function normalizarTextos(datos) {
    for (const campo of Object.keys(LIMITES_TEXTO)) {
        if (Object.hasOwn(datos, campo)) datos[campo] = datos[campo].trim();
    }
}

function esObjeto(datos) {
    return datos !== null && typeof datos === "object" && !Array.isArray(datos);
}

function validarReporte(req, res, next) {
    if (!esObjeto(req.body)) {
        return res.status(400).json({ error: "Enviá los datos del reporte" });
    }

    const error = validarTextos(req.body, false);
    if (error) return res.status(400).json({ error });

    const { idZona, idCategoria } = req.body;
    if (!Number.isInteger(idZona) || idZona <= 0 ||
        !Number.isInteger(idCategoria) || idCategoria <= 0) {
        return res.status(400).json({ error: "Seleccioná una zona y una categoría válidas" });
    }

    normalizarTextos(req.body);
    next();
}

function validarActualizacionReporte(req, res, next) {
    if (!esObjeto(req.body)) {
        return res.status(400).json({ error: "Enviá los datos del reporte" });
    }

    const error = validarTextos(req.body, true);
    if (error) return res.status(400).json({ error });

    if (Object.hasOwn(req.body, "estado") && !ESTADOS_VALIDOS.includes(req.body.estado)) {
        return res.status(400).json({ error: "Estado no válido" });
    }

    normalizarTextos(req.body);
    next();
}

module.exports = { validarReporte, validarActualizacionReporte };
