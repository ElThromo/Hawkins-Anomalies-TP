import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import "../styles/DetalleZona.css";

type Zona = {
  idZona: number;
  nombre: string;
  descripcion: string;
  nivelPeligro: string;
  posX: number | null;
  posY: number | null;
  radio: number | null;
};

type Reporte = {
  idReporte: number;
  titulo: string;
  cuerpo: string;
  estado: string;
  fechaHora: string;
  zona: {
    idZona: number;
    nombre: string;
    nivelPeligro: string;
  };
  usuario: {
    idUsuario: number;
    nombre: string;
  };
  categoria: {
    idCategoria: number;
    nombre: string;
  };
};

const ESTADO_LABELS: Record<string, string> = {
  NO_VERIFICADO: "No verificado",
  EN_INVESTIGACION: "En investigación",
  RESUELTO: "Resuelto"
};

const NIVEL_LABELS: Record<string, string> = {
  BAJO: "Bajo",
  MEDIO: "Medio",
  ALTO: "Alto",
  CRITICO: "Crítico"
};

const COLOR_NIVEL: Record<string, string> = {
  BAJO: "#42c76b",
  MEDIO: "#e6c44a",
  ALTO: "#f28c45",
  CRITICO: "#e84b5b"
};

function DetalleZona() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [zona, setZona] = useState<Zona | null>(null);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:3000";

        const [resZona, resReportes] = await Promise.all([
          fetch(`${apiUrl}/zonas/${id}`),
          fetch(`${apiUrl}/reportes`)
        ]);

        if (!resZona.ok) {
          throw new Error("No se pudo encontrar la zona.");
        }

        if (!resReportes.ok) {
          throw new Error("No se pudieron cargar los reportes.");
        }

        const datosZona: Zona = await resZona.json();
        const datosReportes: Reporte[] = await resReportes.json();

        const reportesDeLaZona = datosReportes.filter(
          (reporte) => reporte.zona.idZona === Number(id)
        );

        setZona(datosZona);
        setReportes(reportesDeLaZona);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los datos."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [id]);

  if (cargando) {
    return (
      <Layout>
        <p className="detalle-mensaje">Cargando zona...</p>
      </Layout>
    );
  }

  if (error || !zona) {
    return (
      <Layout>
        <div className="detalle-zona-error">
          <p className="detalle-mensaje detalle-error">
            {error || "Zona no encontrada."}
          </p>

          <button
            type="button"
            className="btn-secundario"
            onClick={() => navigate("/mapa")}
          >
            Volver al mapa
          </button>
        </div>
      </Layout>
    );
  }

  const colorNivel = COLOR_NIVEL[zona.nivelPeligro] || "#999";

  return (
    <Layout>
      <div className="detalle-zona">

        <button
          type="button"
          className="btn-volver"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        <div className="detalle-header">
          <span
            className="badge-estado"
            style={{
              background: "#1a1a1a",
              color: colorNivel,
              border: `1px solid ${colorNivel}`
            }}
          >
            ● {NIVEL_LABELS[zona.nivelPeligro] || zona.nivelPeligro}
          </span>

          <h1>{zona.nombre}</h1>

          <p className="detalle-meta">
            {reportes.length}{" "}
            {reportes.length === 1
              ? "reporte registrado"
              : "reportes registrados"}
          </p>
        </div>

        <div className="detalle-tags">
          <span className="tag">
            Nivel: {NIVEL_LABELS[zona.nivelPeligro] || zona.nivelPeligro}
          </span>
          <span className="tag tag-zona">
            Reportes: {reportes.length}
          </span>
        </div>

        <div className="detalle-contenido-reporte">
          <p className="detalle-cuerpo">{zona.descripcion}</p>
        </div>

        <section className="detalle-resoluciones">
          <h2>Reportes de esta zona</h2>

          {reportes.length === 0 ? (
            <p className="detalle-mensaje">
              No hay reportes registrados en esta zona.
            </p>
          ) : (
            reportes.map((reporte) => (
              <article
                key={reporte.idReporte}
                className="resolucion-item reporte-zona-card"
                onClick={() => navigate(`/reporte/${reporte.idReporte}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/reporte/${reporte.idReporte}`);
                  }
                }}
              >
                <div className="resolucion-header">
                  <div className="resolucion-info">
                    <h3>{reporte.titulo}</h3>

                    <p className="detalle-meta">
                      Por <strong>{reporte.usuario.nombre}</strong> ·{" "}
                      {new Date(reporte.fechaHora).toLocaleString("es-AR")}
                    </p>
                  </div>

                  <span
                    className={`badge-estado badge-${reporte.estado.toLowerCase()}`}
                  >
                    {ESTADO_LABELS[reporte.estado] || reporte.estado}
                  </span>
                </div>

                <p className="resolucion-texto">{reporte.cuerpo}</p>

                <div className="reporte-zona-datos">
                  <span className="tag">{reporte.categoria.nombre}</span>
                </div>
              </article>
            ))
          )}
        </section>

      </div>
    </Layout>
  );
}

export default DetalleZona;