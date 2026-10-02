
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validarReporte, validarActualizacionReporte } = require("./reporte.validations");

function ejecutar(validar, body) {
    const req = { body };
    const resultado = { estado: null, respuesta: null, continuaciones: 0, req };
    const res = {
        status(estado) { resultado.estado = estado; return this; },
        json(respuesta) { resultado.respuesta = respuesta; return this; }
    };
    validar(req, res, () => { resultado.continuaciones += 1; });
    return resultado;
}

const reporte = () => ({ titulo: "Luces en el bosque", cuerpo: "Vi luces entre los árboles.", idZona: 1, idCategoria: 2 });

test("permite crear sin fotos y limpia espacios exteriores conservando párrafos", () => {
    const datos = { ...reporte(), titulo: "  Luces  ", cuerpo: "  Primer párrafo\n\nSegundo párrafo  " };
    const resultado = ejecutar(validarReporte, datos);
    assert.equal(resultado.continuaciones, 1);
    assert.equal(datos.titulo, "Luces");
    assert.equal(datos.cuerpo, "Primer párrafo\n\nSegundo párrafo");
    assert.equal(Object.hasOwn(datos, "imagenes"), false);
});

for (const [nombre, validar] of [["crear", validarReporte], ["editar", validarActualizacionReporte]]) {
    for (const campo of ["titulo", "cuerpo"]) {
        test(`${nombre}: rechaza ${campo} vacío, espacios y valores que no son texto`, () => {
            for (const valor of ["", " \n\t ", null, false, 0, 123, [], {}, undefined]) {
                const datos = nombre === "crear" ? reporte() : {};
                datos[campo] = valor;
                const resultado = ejecutar(validar, datos);
                assert.equal(resultado.estado, 400, `Valor: ${JSON.stringify(valor)}`);
                assert.equal(resultado.continuaciones, 0);
                assert.equal(typeof resultado.respuesta.error, "string");
            }
        });

        test(`${nombre}: acepta el máximo de ${campo} y rechaza un carácter extra`, () => {
            const limite = campo === "titulo" ? 200 : 2500;
            const datos = nombre === "crear" ? reporte() : {};
            datos[campo] = "a".repeat(limite);
            assert.equal(ejecutar(validar, datos).continuaciones, 1);
            datos[campo] += "a";
            assert.equal(ejecutar(validar, datos).estado, 400);
        });
    }

    test(`${nombre}: rechaza un cuerpo HTTP inexistente o mal formado`, () => {
        for (const body of [undefined, null, [], "texto", false]) {
            assert.equal(ejecutar(validar, body).estado, 400);
        }
    });
}

test("crear requiere ambos textos y zona/categoría con identificadores positivos", () => {
    for (const campo of ["titulo", "cuerpo", "idZona", "idCategoria"]) {
        const datos = reporte();
        delete datos[campo];
        assert.equal(ejecutar(validarReporte, datos).estado, 400);
    }
    for (const campo of ["idZona", "idCategoria"]) {
        for (const valor of [0, -1, 1.5, "1", null]) {
            assert.equal(ejecutar(validarReporte, { ...reporte(), [campo]: valor }).estado, 400);
        }
    }
});

test("editar solo el estado sigue funcionando sin enviar título ni descripción", () => {
    for (const estado of ["NO_VERIFICADO", "EN_INVESTIGACION", "RESUELTO"]) {
        const datos = { estado };
        assert.equal(ejecutar(validarActualizacionReporte, datos).continuaciones, 1);
        assert.deepEqual(datos, { estado });
    }
    for (const estado of ["", null, false, "VERIFICADO"]) {
        assert.equal(ejecutar(validarActualizacionReporte, { estado }).estado, 400);
    }
});

test("editar un solo texto conserva los demás campos ausentes", () => {
    const datos = { titulo: "  Nuevo título  " };
    assert.equal(ejecutar(validarActualizacionReporte, datos).continuaciones, 1);
    assert.deepEqual(datos, { titulo: "Nuevo título" });
});
