
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/Home.css";
import "../styles/CrearReporte.css";
import Layout from "../components/Layout/Layout";

interface Zona {
  idZona: number;
  nombre: string;
}

interface Categoria {
  idCategoria: number;
  nombre: string;
}

function CrearReporte() {
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [idZona, setIdZona] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [idReportePendiente, setIdReportePendiente] = useState<number | null>(null);
  const [imagenes, setImagenes] = useState<FileList | null>(null);

  const { token } = useAuth();
  const navigate = useNavigate();
const [vistasPrevias, setVistasPrevias] = useState<
  { url: string; nombre: string }[]
>([]);

useEffect(() => {
  return () => {
    vistasPrevias.forEach((imagen) => URL.revokeObjectURL(imagen.url));
  };
}, [vistasPrevias]);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resZonas, resCategorias] = await Promise.all([
          fetch("http://localhost:3000/zonas"),
          fetch("http://localhost:3000/categorias")
        ]);

        setZonas(await resZonas.json());
        setCategorias(await resCategorias.json());
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar zonas y categorías");
      }
    }

    cargarDatos();
  }, []);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (enviando) return;
  setError("");

  if (!token) {
    setError("Iniciá sesión para publicar.");
    return;
  }

  if (idReportePendiente === null && (!titulo.trim() || !cuerpo.trim() || !idZona || !idCategoria)) {
    setError("Completá todos los campos");
    return;
  }

  const archivos = Array.from(imagenes ?? []);
  if (archivos.length > 5) {
    setError("Podés subir hasta 5 imágenes. Volvé a elegir los archivos.");
    return;
  }

  const invalido = archivos.find((archivo) =>
    !["image/jpeg", "image/png", "image/webp"].includes(archivo.type) ||
    !/\.(jpe?g|png|webp)$/i.test(archivo.name) ||
    archivo.size > 5 * 1024 * 1024
  );
  if (invalido) {
    setError(`Revisá "${invalido.name}": debe ser JPG, PNG o WebP y pesar como máximo 5 MB.`);
    return;
  }

  let idReporte = idReportePendiente;
  setEnviando(true);

  try {
    if (idReporte === null) {
      const respuesta = await fetch("http://localhost:3000/reportes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: titulo.trim(),
          cuerpo: cuerpo.trim(),
          idZona: Number(idZona),
          idCategoria: Number(idCategoria),
        }),
      });
      const datos = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        throw new Error(datos?.error || "No se pudo crear el reporte.");
      }
      if (!Number.isInteger(datos?.reporte?.idReporte) || datos.reporte.idReporte <= 0) {
        throw new Error("El servidor no devolvió el número del reporte. Revisá Mis reportes antes de volver a publicar.");
      }
      idReporte = datos.reporte.idReporte;
      setIdReportePendiente(idReporte);
    }

    if (archivos.length > 0) {
      if (idReportePendiente !== null) {
        const consulta = await fetch(`http://localhost:3000/reportes/${idReporte}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const actual = await consulta.json().catch(() => null);
        if (!consulta.ok || !Array.isArray(actual?.imagenes)) {
          throw new Error("No se pudo comprobar si las imágenes ya se guardaron. Intentá de nuevo cuando vuelva la conexión.");
        }
        if (actual.imagenes.length > 0) {
          navigate(`/reporte/${idReporte}`);
          return;
        }
      }

      const formData = new FormData();
      archivos.forEach((archivo) => formData.append("imagenes", archivo));

      const respuesta = await fetch(
        `http://localhost:3000/reportes/${idReporte}/imagenes`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null);
        throw new Error(datos?.error || "No se pudieron subir las imágenes.");
      }
    }

    navigate(`/reporte/${idReporte}`);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "No se pudo conectar con el servidor.";
    setError(
      idReporte !== null
        ? `El reporte #${idReporte} ya está publicado, pero no se confirmó la carga de las imágenes. ${mensaje} Podés reintentar desde este formulario o ver el reporte creado.`
        : mensaje
    );
  } finally {
    setEnviando(false);
  }
}

function handleImagenesChange(e: React.ChangeEvent<HTMLInputElement>) {
  const archivos = e.target.files;

  setImagenes(archivos);
  setVistasPrevias(
    Array.from(archivos ?? []).map((archivo) => ({
      url: URL.createObjectURL(archivo),
      nombre: archivo.name,
    }))
  );
}

  return (
    <>
      <Layout>
        <header>
          <h1>Crear reporte</h1>
        </header>

        <form className="reporte-box" onSubmit={handleSubmit}>
          {error && <p className="reporte-error" role="alert">{error}</p>}

          <label>
            Título
            <input
              type="text"
              placeholder="Ej: Luces extrañas en el bosque"
              disabled={enviando || idReportePendiente !== null}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </label>

          <label>
            Descripción
            <textarea
              placeholder="Describí lo que viste con el mayor detalle posible..."
              rows={6}
              disabled={enviando || idReportePendiente !== null}
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
            />
          </label>

          <div className="reporte-selects">
            <label>
              Zona
              <select disabled={enviando || idReportePendiente !== null} value={idZona} onChange={(e) => setIdZona(e.target.value)}>
                <option value="">Seleccioná una zona</option>
                {zonas.map((zona) => (
                  <option key={zona.idZona} value={zona.idZona}>
                    {zona.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Categoría
              <select disabled={enviando || idReportePendiente !== null} value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)}>
                <option value="">Seleccioná una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Imágenes (opcional, máximo 5, hasta 5 MB cada una)
            <input
              type="file"
              disabled={enviando}
              accept="image/png, image/jpeg, image/webp"
              multiple
              onChange={handleImagenesChange}
            />
          </label>
{vistasPrevias.length > 0 && (
  <div className="reporte-vistas-previas">
    <p>Vista previa · Tocá una foto para abrirla en otra pestaña.</p>

    <div className="reporte-vistas-grid">
      {vistasPrevias.map((imagen) => (
        <a
          key={imagen.url}
          href={imagen.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ampliar ${imagen.nombre} en otra pestaña`}
        >
          <img src={imagen.url} alt={imagen.nombre} />
        </a>
      ))}
    </div>
  </div>
)}

          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : idReportePendiente !== null ? "Reintentar carga de imágenes" : "Publicar reporte"}
          </button>
          {idReportePendiente !== null && (
            <button
              type="button"
              disabled={enviando}
              onClick={() => navigate(`/reporte/${idReportePendiente}`)}
            >
              Ver reporte creado
            </button>
          )}
        </form>
      </Layout>
    </>
  );
}

export default CrearReporte;
