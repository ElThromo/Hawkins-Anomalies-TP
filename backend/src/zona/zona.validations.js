const NIVELES_VALIDOS = ["BAJO", "MEDIO", "ALTO", "CRITICO"];

function validarZona(req, res, next) {
  const { nombre, descripcion, nivelPeligro, posX, posY, radio } = req.body;

  if (!nombre || !descripcion || !nivelPeligro) {
    return res.status(400).json({
      error: "Nombre, descripción y nivel de peligro son obligatorios"
    });
  }

  if (
    typeof nombre !== "string" ||
    typeof descripcion !== "string" ||
    typeof nivelPeligro !== "string"
  ) {
    return res.status(400).json({
      error: "Los datos de la zona deben ser texto"
    });
  }

  if (!nombre.trim() || !descripcion.trim() || !nivelPeligro.trim()) {
    return res.status(400).json({
      error: "Nombre, descripción y nivel de peligro son obligatorios"
    });
  }

  if (/\d/.test(nombre) || /\d/.test(descripcion)) {
    return res.status(400).json({
      error: "El nombre y la descripción no deben contener números"
    });
  }

  if (!NIVELES_VALIDOS.includes(nivelPeligro)) {
    return res.status(400).json({
      error: `Nivel de peligro no válido. Debe ser uno de: ${NIVELES_VALIDOS.join(", ")}`
    });
  }

  if (posX !== undefined && posX !== null && typeof posX !== "number") {
    return res.status(400).json({ error: "posX debe ser un número" });
  }

  if (posY !== undefined && posY !== null && typeof posY !== "number") {
    return res.status(400).json({ error: "posY debe ser un número" });
  }

  if (radio !== undefined && radio !== null && typeof radio !== "number") {
    return res.status(400).json({ error: "radio debe ser un número" });
  }

  next();
}

module.exports = {
  validarZona
};