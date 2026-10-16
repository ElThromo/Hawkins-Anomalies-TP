
import ReaccionesFeed from "../components/ReaccionesFeed";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import "../styles/FeedReportes.css";

interface ReporteFeed {
  idReporte: number;
  titulo: string;
  cuerpo: string;
  fechaHora: string;
  estado: string;
  usuario: {
    idUsuario: number;
    nombre: string;
    avatar: string | null;
  };
  zona: { nombre: string; nivelPeligro: string };
  categoria: { nombre: string };
  imagenes: { idImagen: number; url: string }[];
  reacciones: {
    idReaccion: number;
    idUsuario: number;
    idTipoReaccion: number;
    tipoReaccion: { nombre: string; emoji: string };
  }[];
  _count: { comentarios: number };
}

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const ESTADOS: Record<string, string> = {
  NO_VERIFICADO: "No verificado",
  EN_INVESTIGACION: "En investigación",
  RESUELTO: "Resuelto"
};

function Publicacion({ reporte }: { reporte: ReporteFeed }) {
  const [indiceFoto, setIndiceFoto] = useState(0);
  const [avatarFallido, setAvatarFallido] = useState(false);
  const [textoCompleto, setTextoCompleto] = useState(false);

  const fotos = reporte.imagenes;
  const foto = fotos[indiceFoto % (fotos.length || 1)];
  const textoLargo = reporte.cuerpo.length > 350;

  function cambiarFoto(direccion: number) {
    if (fotos.length < 2) return;
    setIndiceFoto(
      (actual) => (actual + direccion + fotos.length) % fotos.length
    );
  }

  return (
    <article className="feed-publicacion">
      <div className="feed-autor">
        <div className="feed-avatar" aria-hidden="true">
          {reporte.usuario.avatar && !avatarFallido ? (
            <img
              src={new URL(reporte.usuario.avatar, `${API_URL}/`).href}
              alt=""
              onError={() => setAvatarFallido(true)}
            />
          ) : (
            reporte.usuario.nombre.charAt(0).toUpperCase()
          )}
        </div>

        <div className="feed-autor-datos">
          <strong>{reporte.usuario.nombre}</strong>
          <time dateTime={reporte.fechaHora}>
            {new Date(reporte.fechaHora).toLocaleString("es-AR")}
          </time>
        </div>

        <span className={`feed-estado feed-estado-${reporte.estado.toLowerCase()}`}>
          {ESTADOS[reporte.estado] ?? reporte.estado}
        </span>
      </div>

      <h2 className="feed-titulo">
        <Link to={`/reporte/${reporte.idReporte}`}>{reporte.titulo}</Link>
      </h2>

      <div className="feed-etiquetas">
        <span>{reporte.zona.nombre}</span>
        <span>{reporte.categoria.nombre}</span>
      </div>

      <p className="feed-descripcion">
        {textoLargo && !textoCompleto
          ? `${reporte.cuerpo.slice(0, 350)}…`
          : reporte.cuerpo}
      </p>

      {textoLargo && (
        <button
          type="button"
          className="feed-ver-mas"
          aria-expanded={textoCompleto}
          onClick={() => setTextoCompleto((actual) => !actual)}
        >
          {textoCompleto ? "Ver menos" : "Leer más"}
        </button>
      )}

      {foto && (
        <div className="feed-galeria">
          <Link to={`/reporte/${reporte.idReporte}`}>
            <img
              className="feed-foto"
              src={new URL(foto.url, `${API_URL}/`).href}
              alt={`Foto ${indiceFoto + 1} de ${reporte.titulo}`}
              loading="lazy"
            />
          </Link>

          {fotos.length > 1 && (
            <div className="feed-galeria-controles">
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={() => cambiarFoto(-1)}
              >
                ‹
              </button>
              <span aria-live="polite">
                {indiceFoto + 1} / {fotos.length}
              </span>
              <button
                type="button"
                aria-label="Foto siguiente"
                onClick={() => cambiarFoto(1)}
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="feed-pie">
              <ReaccionesFeed
          idReporte={reporte.idReporte}
          iniciales={reporte.reacciones}
        />

        <Link to={`/reporte/${reporte.idReporte}`}>
          {reporte._count.comentarios}{" "}
          {reporte._count.comentarios === 1 ? "comentario" : "comentarios"}
          {" · Ver reporte"}
        </Link>
      </div>
    </article>
  );
}

function Reportes() {
  const [reportes, setReportes] = useState<ReporteFeed[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarReportes() {
      setCargando(true);
      setError("");

      try {
        const respuesta = await fetch(`${API_URL}/reportes`, {
          signal: controller.signal
        });

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los reportes.");
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error("El servidor devolvió una respuesta inesperada.");
        }

        if (!controller.signal.aborted) setReportes(datos);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "No se pudo conectar con el servidor."
          );
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }

    cargarReportes();
    return () => controller.abort();
  }, [intento]);

  return (
    <Layout>
      <header className="feed-encabezado">
        <h1>Reportes</h1>
        <h2>Las últimas anomalías compartidas por la comunidad.</h2>
      </header>

      <section className="feed-lista" aria-label="Publicaciones de reportes">
        {cargando && <p role="status">Cargando reportes...</p>}

        {!cargando && error && (
          <div role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => setIntento((actual) => actual + 1)}>
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && reportes.length === 0 && (
          <p>Todavía no hay reportes publicados.</p>
        )}

        {!cargando && !error &&
          reportes.map((reporte) => (
            <Publicacion key={reporte.idReporte} reporte={reporte} />
          ))}
      </section>
    </Layout>
  );
}

export default Reportes;
