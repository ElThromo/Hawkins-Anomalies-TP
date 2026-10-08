
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const carpetaAvatares = path.join(__dirname, "../../uploads/avatars");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.mkdir(carpetaAvatares, { recursive: true }, (error) => {
            cb(error, carpetaAvatares);
        });
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        const nombreUnico = `avatar-${req.usuario.idUsuario}-${Date.now()}${extension}`;
        cb(null, nombreUnico);
    }
});

function filtrarArchivo(req, file, cb) {
    const tiposPermitidos = /jpeg|jpg|png|webp/;
    const extensionValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeValido = tiposPermitidos.test(file.mimetype);

    if (extensionValida && mimeValido) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)"));
    }
}

const uploadAvatar = multer({
    storage,
    fileFilter: filtrarArchivo,
    limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = { uploadAvatar };
