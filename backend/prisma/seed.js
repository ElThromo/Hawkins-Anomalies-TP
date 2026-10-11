const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const prisma = require("../src/prisma");

const SALT_ROUNDS = 10;
const CONTRASENA = "hola1234";

const CARPETA_ASSETS = path.join(__dirname, "seed-assets");
const CARPETA_UPLOADS = path.join(__dirname, "../uploads");

function fecha(diasAtras, hora, minutos = 0) {
  const f = new Date();
  f.setDate(f.getDate() - diasAtras);
  f.setHours(hora, minutos, 0, 0);
  return f;
}

function masHoras(fechaBase, horas) {
  return new Date(fechaBase.getTime() + horas * 60 * 60 * 1000);
}

async function obtenerOCrear(delegado, where, data) {
  const existente = await delegado.findFirst({ where });
  return existente ?? (await delegado.create({ data }));
}

function copiarImagen(carpetaOrigen, archivo, carpetaDestino) {
  const origen = path.join(CARPETA_ASSETS, carpetaOrigen, archivo);

  if (!fs.existsSync(origen)) {
    console.log(`  ⚠ falta la imagen seed-assets/${carpetaOrigen}/${archivo}`);
    return null;
  }

  const nombreFinal = `seed-${archivo}`; // prefijo para no chocar con las subidas reales
  const dirDestino = path.join(CARPETA_UPLOADS, carpetaDestino);

  fs.mkdirSync(dirDestino, { recursive: true });
  fs.copyFileSync(origen, path.join(dirDestino, nombreFinal));

  return carpetaDestino
    ? `/uploads/${carpetaDestino}/${nombreFinal}`
    : `/uploads/${nombreFinal}`;
}

async function cargarUsuarios() {
  const contrasenaHash = await bcrypt.hash(CONTRASENA, SALT_ROUNDS);

  const lista = [
    { nombre: "Dustin Henderson", email: "dustin.henderson@st.com", rol: "ADMIN", avatar: "dustin-henderson.jpg" },
    { nombre: "Steve Harrington", email: "steve.harrington@st.com", rol: "INVESTIGADOR", avatar: "steve-harrington.png" },
    { nombre: "Jim Hopper", email: "jim.hopper@st.com", rol: "INVESTIGADOR", avatar: "jim-hopper.png" },
    { nombre: "Alan Wake", email: "alan.wake@st.com", rol: "USUARIO", avatar: "alan-wake.png" },
    { nombre: "Jimmy Hopkins", email: "jimmy.hopkins@st.com", rol: "USUARIO", avatar: "jimmy-hopkins.png" },
    { nombre: "Casper Darling", email: "casper.darling@st.com", rol: "USUARIO", avatar: "casper-darling.png" }
  ];

  const usuarios = {};

  for (const u of lista) {
    const { avatar, ...datos } = u;

    let usuario = await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: { ...datos, contrasenaHash }
    });

    if (!usuario.avatar && avatar) {
      const url = copiarImagen("avatars", avatar, "avatars");

      if (url) {
        usuario = await prisma.usuario.update({
          where: { idUsuario: usuario.idUsuario },
          data: { avatar: url }
        });
      }
    }

    usuarios[u.nombre] = usuario;
  }

  return usuarios;
}

async function cargarZonas() {
  const lista = [
    { nombre: "Laboratorio", descripcion: "Instalación del gobierno en las afueras del pueblo. Acceso restringido.", nivelPeligro: "CRITICO", posX: 355, posY: 925, radio: 50 },
    { nombre: "Bosque Norte", descripcion: "Zona boscosa donde se concentran la mayoría de los avistamientos.", nivelPeligro: "ALTO", posX: 700, posY: 143, radio: 210 },
    { nombre: "Bosque Este", descripcion: "Zona boscosa al este de Hawkins, con lago pequeño y ruta principal atravesandola.", nivelPeligro: "ALTO", posX: 202, posY: 500, radio: 200 },
    { nombre: "Centro", descripcion: "Zona comercial y residencial principal de Hawkins.", nivelPeligro: "MEDIO", posX: 800, posY: 685, radio: 100 },
    { nombre: "Centro Comercial", descripcion: "Mall de reciente apertura, con mucho movimiento de gente.", nivelPeligro: "MEDIO", posX: 547, posY: 386, radio: 50 },
    { nombre: "Lago", descripcion: "Zona recreativa junto al lago, popular entre las familias del pueblo.", nivelPeligro: "BAJO", posX: 1200, posY: 935, radio: 130 }
  ];

  const zonas = {};

  for (const z of lista) {
    zonas[z.nombre] = await obtenerOCrear(
      prisma.zona,
      { nombre: z.nombre },
      z
    );
  }

  return zonas;
}

async function cargarVigilantes(zonas) {
  const lista = [
    { nombre: "Murray Bauman", zona: "Laboratorio" },
    { nombre: "Mike Wheeler", zona: "Bosque Norte" },
    { nombre: "Robin Buckley", zona: "Bosque Este" },
    { nombre: "Jonathan Byers", zona: "Centro" },
    { nombre: "Nancy Wheeler", zona: "Centro Comercial" },
    { nombre: "Lucas Sinclair", zona: "Lago" }
  ];

  for (const v of lista) {
    const idZona = zonas[v.zona].idZona;
    await obtenerOCrear(prisma.vigilante, { nombre: v.nombre, idZona }, { nombre: v.nombre, idZona });
  }
}

async function cargarCategorias() {
  const lista = [
    { nombre: "Criaturas", descripcion: "Seres de origen desconocido o comportamiento anómalo." },
    { nombre: "Fenómenos eléctricos", descripcion: "Apagones, luces extrañas e interferencias." },
    { nombre: "Desapariciones", descripcion: "Personas u objetos que desaparecen sin explicación." },
    { nombre: "Avistamientos", descripcion: "Cosas inusuales vistas u oídas en el pueblo." },
    { nombre: "Portales y grietas", descripcion: "Aperturas, nieblas y señales de otra dimensión." }
  ];

  const categorias = {};

  for (const c of lista) {
    categorias[c.nombre] = await obtenerOCrear(prisma.categoria, { nombre: c.nombre }, c);
  }

  return categorias;
}


async function cargarReportes(usuarios, zonas, categorias) {
  const reportes = [
    // hace 3 días
    {
      titulo: "Luces rojas parpadeando sobre el laboratorio",
      cuerpo: "Anoche vi luces rojas parpadeando entre los árboles, justo detrás de la reja del laboratorio. Duraron casi diez minutos y después todo quedó en silencio.",
      autor: "Alan Wake", zona: "Laboratorio", categoria: "Fenómenos eléctricos",
      estado: "RESUELTO", dias: 3, hora: 10, minutos: 0,
      imagenes: ["luces-laboratorio.jpg"],
      resolucion: {
        investigador: "Steve Harrington",
        titulo: "Falla en el generador auxiliar",
        detalle: "Se inspeccionó el perímetro del laboratorio. Las luces provenían de un generador auxiliar con fallas que se encendía de forma intermitente. Se notificó al personal de mantenimiento y el fenómeno no volvió a registrarse."
      }
    },
    {
      titulo: "Huellas enormes junto al arroyo",
      cuerpo: "Mientras caminaba por el sendero encontré huellas de más de medio metro de largo en el barro, cerca del arroyo. Parecían de algo con garras.",
      autor: "Jimmy Hopkins", zona: "Bosque Norte", categoria: "Criaturas",
      estado: "RESUELTO", dias: 3, hora: 14, minutos: 30,
      imagenes: ["huellas-arroyo.jpg"],
      resolucion: {
        investigador: "Jim Hopper",
        titulo: "Huellas de oso, sin riesgo inmediato",
        detalle: "Se recorrió la zona junto a guardabosques. Las huellas corresponden a un oso adulto. Se señalizó el sendero y se recomienda no acercarse al arroyo al anochecer."
      }
    },
    {
      titulo: "Apagón repentino en todo el centro",
      cuerpo: "Se cortó la luz en todo el centro durante unos veinte minutos. Justo antes, las lámparas de la calle titilaron todas al mismo tiempo.",
      autor: "Alan Wake", zona: "Centro", categoria: "Fenómenos eléctricos",
      estado: "RESUELTO", dias: 3, hora: 20, minutos: 15,
      resolucion: {
        investigador: "Steve Harrington",
        titulo: "Sobrecarga en la subestación",
        detalle: "La compañía eléctrica confirmó una sobrecarga en la subestación del centro. Las luces titilaron por la inestabilidad previa al corte. El servicio ya fue restablecido."
      }
    },

    // hace 2 días
    {
      titulo: "Bicicleta abandonada en la orilla del lago",
      cuerpo: "Apareció una bicicleta tirada junto al agua, todavía con la mochila puesta. Nadie del barrio sabe de quién es ni dónde está su dueño.",
      autor: "Casper Darling", zona: "Lago", categoria: "Desapariciones",
      estado: "RESUELTO", dias: 2, hora: 9, minutos: 45,
      resolucion: {
        investigador: "Jim Hopper",
        titulo: "Bicicleta devuelta a su dueña",
        detalle: "Se identificó a la propietaria, que la había olvidado tras una tarde de pesca. No hay ninguna persona desaparecida, por lo que el caso se cierra."
      }
    },
    {
      titulo: "Gritos que vienen de la fabrica abandonada",
      cuerpo: "Varias noches seguidas se escuchan gritos desde la fabrica abandonada. No hay nadie viviendo cerca y las voces no suenan humanas.",
      autor: "Jimmy Hopkins", zona: "Bosque Este", categoria: "Avistamientos",
      estado: "RESUELTO", dias: 2, hora: 16, minutos: 0,
      resolucion: {
        investigador: "Steve Harrington",
        titulo: "Fenómeno sin explicación natural",
        detalle: "Se registraron ecos que no coinciden con ninguna fuente humana ni animal conocida. Se instalaron señales de advertencia y la zona queda bajo vigilancia permanente."
      }
    },
    {
      titulo: "Niebla roja que no se mueve con el viento",
      cuerpo: "Al amanecer había una niebla de color rojizo sobre el bosque que no se desplazaba aunque había viento. Los perros del vecindario no dejaron de ladrar.",
      autor: "Alan Wake", zona: "Bosque Norte", categoria: "Portales y grietas",
      estado: "EN_INVESTIGACION", dias: 2, hora: 21, minutos: 30,
      imagenes: ["niebla-roja.jpeg"]
    },

    // hace 1 día
    {
      titulo: "Golpes metálicos bajo el estacionamiento",
      cuerpo: "Trabajo en el centro comercial y por la noche se escuchan golpes metálicos que parecen venir desde abajo del suelo del estacionamiento.",
      autor: "Alan Wake", zona: "Centro Comercial", categoria: "Portales y grietas",
      estado: "EN_INVESTIGACION", dias: 1, hora: 11, minutos: 20
    },
    {
      titulo: "Puerta metálica abierta en plena noche",
      cuerpo: "Pasé en bicicleta por el camino lateral y había una puerta metálica abierta que nunca había visto. Salía un zumbido grave desde adentro.",
      autor: "Jimmy Hopkins", zona: "Laboratorio", categoria: "Avistamientos",
      estado: "NO_VERIFICADO", dias: 1, hora: 19, minutos: 0,
      imagenes: ["puerta-metalica.jpg"]
    }
  ];

  for (const r of reportes) {
    const fechaHora = fecha(r.dias, r.hora, r.minutos);

    const reporte = await obtenerOCrear(
      prisma.reporte,
      { titulo: r.titulo },
      {
        titulo: r.titulo,
        cuerpo: r.cuerpo,
        estado: r.estado,
        fechaHora,
        idZona: zonas[r.zona].idZona,
        idCategoria: categorias[r.categoria].idCategoria,
        idUsuario: usuarios[r.autor].idUsuario
      }
    );

    for (const archivo of r.imagenes ?? []) {
      const url = copiarImagen("reportes", archivo, "");

      if (url) {
        await obtenerOCrear(
          prisma.imagenReporte,
          { idReporte: reporte.idReporte, url },
          { idReporte: reporte.idReporte, url }
        );
      }
    }

    if (r.resolucion) {
      await prisma.resolucion.upsert({
        where: { idReporte: reporte.idReporte },
        update: {},
        create: {
          idReporte: reporte.idReporte,
          idUsuario: usuarios[r.resolucion.investigador].idUsuario,
          resolucion: r.resolucion.titulo,
          cuerpoResolucion: r.resolucion.detalle,
          fechaHora: masHoras(fechaHora, 6)
        }
      });
    }
  }
}

async function main() {
  console.log("Cargando datos de ejemplo...");

  const usuarios = await cargarUsuarios();
  console.log("  ✔ usuarios");

  const zonas = await cargarZonas();
  console.log("  ✔ zonas");

  await cargarVigilantes(zonas);
  console.log("  ✔ vigilantes");

  const categorias = await cargarCategorias();
  console.log("  ✔ categorías");

  await cargarReportes(usuarios, zonas, categorias);
  console.log("  ✔ reportes, imágenes y resoluciones");

  console.log(`\nListo. Todos los usuarios tienen la contraseña: ${CONTRASENA}`);
  console.log("  ADMIN         dustin.henderson@st.com");
  console.log("  INVESTIGADOR  steve.harrington@st.com");
  console.log("  INVESTIGADOR  jim.hopper@st.com");
  console.log("  USUARIO       alan.wake@st.com");
  console.log("  USUARIO       jimmy.hopkins@st.com");
  console.log("  USUARIO       casper.darling@st.com");
}

main()
  .catch((error) => {
    console.error("Error al cargar los datos de ejemplo:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
