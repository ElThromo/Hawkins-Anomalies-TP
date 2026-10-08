
const express = require("express");
const usuarioController = require("./usuario.controller");
const {
  validarUsuario,
  validarActualizacionUsuario,
  validarEdicionPerfil
} = require("./usuario.validations");
const {
  verificarToken,
  verificarAdmin
} = require("../middlewares/auth.middleware");
const { verificarRol } = require("../middlewares/rol.middleware");
const { uploadAvatar } = require("../middlewares/uploadAvatar.middleware");

const router = express.Router();
router.get(
    "/top-contribuyentes",
    usuarioController.obtenerTopContribuyentes
);

router.get("/", verificarToken, verificarRol("ADMIN"), usuarioController.obtenerUsuarios);
router.get("/:id", usuarioController.obtenerUsuarioPorId);
router.post("/", validarUsuario, usuarioController.crearUsuario);
router.put("/:id", verificarToken, verificarAdmin, validarActualizacionUsuario, usuarioController.actualizarUsuario);
router.delete("/:id", verificarToken, verificarAdmin, usuarioController.eliminarUsuario);
router.put("/perfil/editar", verificarToken, validarEdicionPerfil, usuarioController.actualizarPerfilPropio);
router.post(
    "/perfil/avatar",
    verificarToken,
    (req, res, next) => {
        uploadAvatar.single("avatar")(req, res, (error) => {
            if (!error) return next();

            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    error: "La foto debe pesar como máximo 2 MB."
                });
            }

            if (error.code === "LIMIT_UNEXPECTED_FILE") {
                return res.status(400).json({
                    error: "Seleccioná una sola foto de perfil."
                });
            }

            if (error.message === "Solo se permiten imágenes (jpeg, jpg, png, webp)") {
                return res.status(400).json({
                    error: "Usá una imagen JPG, PNG o WebP."
                });
            }

            console.error("Error al recibir el avatar:", error);
            return res.status(500).json({
                error: "No se pudo guardar la foto en el servidor."
            });
        });
    },
    usuarioController.subirAvatar
);

module.exports = router;
