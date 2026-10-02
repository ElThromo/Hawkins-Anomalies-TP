
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

const MAX_TITULO = 200;
const MAX_DESCRIPCION = 2500;

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
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [errorImagenes, setErrorImagenes] = useState("");
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);
  const [zoomImagen, setZoomImagen] = useState(1);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [vistasPrevias, setVistasPrevias] = useState<
  { url: string; nombre: string }[]
>([]);

useEffect(() => {
  if (!imagenAmpliada) return;
  const visor = document.getElementById("visor-imagen");
  const area = visor?.querySelector<HTMLElement>(".visor-area");
  const lienzo = area?.querySelector<HTMLElement>(".visor-lienzo");
  if (!(visor instanceof HTMLDialogElement) || !area || !lienzo) return;

  if (!visor.open) visor.showModal();
  const overflowAnterior = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  let arrastre: { id: number; x: number; y: number; left: number; top: number } | null = null;

  function ampliar(nuevo: number, x: number, y: number) {
    if (!area || !lienzo) return;
    const anterior = Number(area.dataset.zoom || 1);
    const zoom = Math.max(1, Math.min(3, nuevo));
    const proporcion = zoom / anterior;
    const left = (area.scrollLeft + x) * proporcion - x;
    const top = (area.scrollTop + y) * proporcion - y;

    lienzo.style.width = `${zoom * 100}%`;
    lienzo.style.height = `${zoom * 100}%`;
    area.dataset.zoom = String(zoom);
    setZoomImagen(zoom);
    area.scrollLeft = zoom === 1 ? 0 : left;
    area.scrollTop = zoom === 1 ? 0 : top;
  }

  function rueda(evento: WheelEvent) {
    if (!area) return;
    evento.preventDefault();
    const rect = area.getBoundingClientRect();
    const zoom = Number(area.dataset.zoom || 1);
    const delta = evento.deltaY * (evento.deltaMode === 1 ? 16 : evento.deltaMode === 2 ? area.clientHeight : 1);
    ampliar(zoom * Math.exp(-Math.max(-100, Math.min(100, delta)) * 0.002),
      evento.clientX - rect.left, evento.clientY - rect.top);
  }

  function dobleClic(evento: MouseEvent) {
    if (!area) return;
    const rect = area.getBoundingClientRect();
    ampliar(Number(area.dataset.zoom || 1) > 1 ? 1 : 2,
      evento.clientX - rect.left, evento.clientY - rect.top);
  }

  function empezar(evento: PointerEvent) {
    if (!area || evento.button !== 0 || !evento.isPrimary) return;
    area.focus({ preventScroll: true });
    if (Number(area.dataset.zoom || 1) <= 1) return;
    evento.preventDefault();
    arrastre = { id: evento.pointerId, x: evento.clientX, y: evento.clientY,
      left: area.scrollLeft, top: area.scrollTop };
    area.setPointerCapture(evento.pointerId);
    area.dataset.arrastrando = "true";
  }

  function mover(evento: PointerEvent) {
    if (!area || !arrastre || evento.pointerId !== arrastre.id) return;
    area.scrollLeft = arrastre.left - (evento.clientX - arrastre.x);
    area.scrollTop = arrastre.top - (evento.clientY - arrastre.y);
  }

  function terminar(evento: PointerEvent) {
    if (!area || !arrastre || evento.pointerId !== arrastre.id) return;
    arrastre = null;
    delete area.dataset.arrastrando;
    if (area.hasPointerCapture(evento.pointerId)) area.releasePointerCapture(evento.pointerId);
  }

  area.addEventListener("wheel", rueda, { passive: false });
  area.addEventListener("dblclick", dobleClic);
  area.addEventListener("pointerdown", empezar);
  area.addEventListener("pointermove", mover);
  area.addEventListener("pointerup", terminar);
  area.addEventListener("pointercancel", terminar);
  area.addEventListener("lostpointercapture", terminar);

  return () => {
    document.body.style.overflow = overflowAnterior;
    area.removeEventListener("wheel", rueda);
    area.removeEventListener("dblclick", dobleClic);
    area.removeEventListener("pointerdown", empezar);
    area.removeEventListener("pointermove", mover);
    area.removeEventListener("pointerup", terminar);
    area.removeEventListener("pointercancel", terminar);
    area.removeEventListener("lostpointercapture", terminar);
  };
}, [imagenAmpliada]);

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

  if (idReportePendiente === null) {
    if (!titulo.trim()) {
      setError("El título no puede quedar vacío ni contener solo espacios");
      return;
    }
    if (!cuerpo.trim()) {
      setError("La descripción no puede quedar vacía ni contener solo espacios");
      return;
    }
    if (titulo.length > MAX_TITULO) {
      setError(`El título admite hasta ${MAX_TITULO} caracteres`);
      return;
    }
    if (cuerpo.length > MAX_DESCRIPCION) {
      setError(`La descripción admite hasta ${MAX_DESCRIPCION} caracteres`);
      return;
    }
    if (!idZona || !idCategoria) {
      setError("Seleccioná una zona y una categoría");
      return;
    }
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

function quitarImagen(indice: number) {
  if (enviando) return;

  const restantes = imagenes.filter(
    (_, posicion) => posicion !== indice
  );

  setImagenAmpliada(null);
  setImagenes(restantes);
  setErrorImagenes("");

  setVistasPrevias(
    restantes.map((archivo) => ({
      url: URL.createObjectURL(archivo),
      nombre: archivo.name,
    }))
  );
}

function handleImagenesChange(e: React.ChangeEvent<HTMLInputElement>) {
  const archivosElegidos = Array.from(e.currentTarget.files ?? []);

  // Permite volver a seleccionar archivos después.
  e.currentTarget.value = "";

  if (archivosElegidos.length === 0) return;

  // Evita agregar nuevamente una foto que ya seleccionaste.
  const nuevas = archivosElegidos.filter(
    (archivo) =>
      !imagenes.some(
        (anterior) =>
          anterior.name === archivo.name &&
          anterior.size === archivo.size &&
          anterior.lastModified === archivo.lastModified
      )
  );

  // Conserva las anteriores y suma las nuevas.
  const seleccionados = [...imagenes, ...nuevas];
  let mensaje = "";

  if (seleccionados.length > 5) {
    mensaje = "Podés agregar hasta 5 imágenes en total.";
  } else {
    const formatoInvalido = seleccionados.find(
      (archivo) =>
        !["image/jpeg", "image/png", "image/webp"].includes(archivo.type) ||
        !/\.(jpe?g|png|webp)$/i.test(archivo.name)
    );

    const demasiadoGrande = seleccionados.find(
      (archivo) => archivo.size > 5 * 1024 * 1024
    );

    if (formatoInvalido) {
      mensaje = `"${formatoInvalido.name}" no tiene un formato permitido. Elegí JPG, PNG o WebP.`;
    } else if (demasiadoGrande) {
      mensaje = `"${demasiadoGrande.name}" supera los 5 MB permitidos.`;
    }
  }

  setErrorImagenes(mensaje);

  // Si la nueva selección es inválida, conserva las fotos anteriores.
  if (mensaje) return;

  setImagenes(seleccionados);

  setVistasPrevias(
    seleccionados.map((archivo) => ({
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
              required
              maxLength={MAX_TITULO}
              aria-describedby="reporte-titulo-contador"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <small id="reporte-titulo-contador" className="reporte-contador">
            {titulo.length} / {MAX_TITULO} caracteres
            {titulo.length >= MAX_TITULO && " — Alcanzaste el máximo permitido"}
            </small>
          </label>

          <label>
            Descripción
            <textarea
              placeholder="Describí lo que viste con el mayor detalle posible..."
              rows={6}
              disabled={enviando || idReportePendiente !== null}
              required
              maxLength={MAX_DESCRIPCION}
              aria-describedby="reporte-descripcion-contador"
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
            />
            <small id="reporte-descripcion-contador" className="reporte-contador">
              {cuerpo.length} / {MAX_DESCRIPCION} caracteres
            </small>
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
          {errorImagenes && (
  <p className="reporte-error" role="alert">
    {errorImagenes}
  </p>
)}
{vistasPrevias.length > 0 && (
  <div className="reporte-vistas-previas">
    <p>
      {imagenes.length} / 5 imágenes seleccionadas.
      Tocá una foto para ampliarla.
    </p>

    <div className="reporte-vistas-grid">
      {vistasPrevias.map((imagen, indice) => (
  <div key={imagen.url} className="reporte-vista-item">
    <button
      type="button"
      className="reporte-miniatura"
      aria-label={`Ampliar ${imagen.nombre}`}
      onClick={() => {
        setZoomImagen(1);
        setImagenAmpliada(imagen.url);
      }}
    >
      <img src={imagen.url} alt={imagen.nombre} />
    </button>

    <button
      type="button"
      className="reporte-quitar-imagen"
      aria-label={`Quitar ${imagen.nombre}`}
      title="Quitar imagen"
      disabled={enviando}
      onClick={() => quitarImagen(indice)}
    >
      ×
    </button>
  </div>
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
      {imagenAmpliada && (
  <dialog
    id="visor-imagen"
    className="visor-imagen"
    aria-label="Vista previa ampliada"
    onClose={() => setImagenAmpliada(null)}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        e.currentTarget.close();
      }
    }}
  >
    <div className="visor-controles">
      <button
        type="button"
        aria-label="Reducir imagen"
        disabled={zoomImagen <= 1}
        onClick={() => setZoomImagen((zoom) => Math.max(1, zoom - 0.5))}
      >
        −
      </button>

      <span aria-live="polite">
        {Math.round(zoomImagen * 100)}%
      </span>

      <button
        type="button"
        aria-label="Ampliar imagen"
        disabled={zoomImagen >= 3}
        onClick={() => setZoomImagen((zoom) => Math.min(3, zoom + 0.5))}
      >
        +
      </button>

      <button type="button" onClick={() => setZoomImagen(1)}>
        Restablecer
      </button>

      <button
        type="button"
        autoFocus
        onClick={(e) => e.currentTarget.closest("dialog")?.close()}
      >
        Cerrar
      </button>
    </div>

    <div className="visor-area" data-zoom={zoomImagen} tabIndex={0}>
      <div
        className="visor-lienzo"
        style={{
          width: `${zoomImagen * 100}%`,
          height: `${zoomImagen * 100}%`,
        }}
      >
        <img
          src={imagenAmpliada}
          alt="Vista previa ampliada"
          draggable={false}
        />
      </div>
    </div>
  </dialog>
)}
      </Layout>
    </>
  );
}

export default CrearReporte;
