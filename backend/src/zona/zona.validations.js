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

    if (
    posX !== undefined &&
    posX !== null &&
    (!Number.isInteger(posX) || posX < 0 || posX > 1473)
  ) {
    return res.status(400).json({
      error: "La posición X debe ser un número entero entre 0 y 1473"
    });
  }

  if (
    posY !== undefined &&
    posY !== null &&
    (!Number.isInteger(posY) || posY < 0 || posY > 1075)
  ) {
    return res.status(400).json({
      error: "La posición Y debe ser un número entero entre 0 y 1075"
    });
  }

  if (
    radio !== undefined &&
    radio !== null &&
    (!Number.isInteger(radio) || radio <= 0 || radio > 2147483647)
  ) {
    return res.status(400).json({
      error: "El radio debe ser un número entero positivo dentro del rango permitido"
    });
  }

  next();
}

module.exports = {
  validarZona
};