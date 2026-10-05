
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import "../styles/PanelInvestigador.css";

type EstadoReporte = "NO_VERIFICADO" | "EN_INVESTIGACION" | "RESUELTO";

interface Reporte {
  idReporte: number;
  titulo?: string;
  estado?: EstadoReporte;
  zona?: { idZona: number; nombre: string; nivelPeligro: string };
  categoria?: { idCategoria: number; nombre: string };
}

function InvestigadorPanel() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [errorEstado, setErrorEstado] = useState("");
  const [errorCarga, setErrorCarga] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000";

 useEffect(() => {
  let cancelado = false;

  async function cargarReportes() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/reportes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const datos = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          datos?.error || "No se pudieron cargar los reportes."
        );
      }

      if (!Array.isArray(datos)) {
        throw new Error("El servidor devolvió una respuesta inesperada.");
      }

      if (!cancelado) {
        setReportes(datos);
        setErrorCarga("");
      }
    } catch (error) {
      if (!cancelado) {
        setErrorCarga(
          error instanceof Error
            ? error.message
            : "No se pudo conectar con el servidor."
        );
      }
    } finally {
      if (!cancelado) setCargando(false);
    }
  }

  cargarReportes();

  return () => {
    cancelado = true;
  };
}, [API_URL]);

  async function cambiarEstado(
  idReporte: number,
  nuevoEstado: EstadoReporte
) {
  setErrorEstado("");

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/reportes/${idReporte}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const datos = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        datos?.error || "No se pudo actualizar el estado."
      );
    }

    setReportes((anteriores) =>
      anteriores.map((reporte) =>
        reporte.idReporte === idReporte
          ? { ...reporte, estado: nuevoEstado }
          : reporte
      )
    );
  } catch (error) {
    setErrorEstado(
      error instanceof Error
        ? error.message
        : "No se pudo conectar con el servidor."
    );
  }
}

  const reportesFiltrados = reportes.filter((r) => {
    if (filtroEstado === "TODOS") return true;
    return (r.estado || "NO_VERIFICADO") === filtroEstado;
  });

  const getBadgeStyle = (estado?: EstadoReporte) => {
    switch (estado) {
      case "RESUELTO":
        return { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" };
      case "EN_INVESTIGACION":
        return { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)" };
      default:
        return { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" };
    }
  };

  return (
    <Layout>
      <div className="investigador-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
        <header style={{ marginBottom: "2rem" }}>
          <h1 className="admin-titulo">
            Panel de investigador
          </h1>
        </header>
{errorEstado && (
  <p role="alert" style={{ color: "#ff8080" }}>
    {errorEstado}
  </p>
)}
        {/* Filtros por Estado */}
        <div 
          style={{ 
            display: "flex", 
            gap: "0.5rem", 
            marginBottom: "1.5rem", 
            background: "#1e293b", 
            padding: "0.35rem", 
            borderRadius: "10px",
            width: "fit-content",
            border: "1px solid #334155"
          }}
        >
          {[
            { label: "Todos", value: "TODOS" },
            { label: "No Verificados", value: "NO_VERIFICADO" },
            { label: "En Investigación", value: "EN_INVESTIGACION" },
            { label: "Resueltos", value: "RESUELTO" }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFiltroEstado(tab.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: filtroEstado === tab.value ? "#ef4444" : "transparent",
                color: filtroEstado === tab.value ? "#ffffff" : "#94a3b8"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listado de Reportes */}
        {cargando ? (
          <div style={{ color: "#94a3b8", padding: "3rem 0", textAlign: "center" }}>
            Cargando reportes del sistema...
          </div>
        ) : errorCarga ? (
  <div role="alert" style={{ color: "#ff8080", padding: "1rem" }}>
    <p>{errorCarga}</p>
    <button type="button" onClick={() => window.location.reload()}>
      Reintentar
    </button>
  </div>
) : reportesFiltrados.length === 0 ? (
          <div style={{ background: "#0f172a", border: "1px dashed #334155", borderRadius: "12px", padding: "3rem", textAlign: "center", color: "#64748b" }}>
            No se encontraron reportes en esta sección.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {reportesFiltrados.map((rep) => {
              const estadoActual = rep.estado || "NO_VERIFICADO";
              const badge = getBadgeStyle(estadoActual);

              return (
                <div
                  key={rep.idReporte}
                  onClick={() => navigate(`/reporte/${rep.idReporte}`)}
                  className="card-reporte-hover"
                  style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <div>
                    {/* Encabezado con ID discreto y badge de estado */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          color: "#64748b",
                          background: "#1e293b",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px"
                        }}
                      >
                        #{rep.idReporte}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "9999px",
                          whiteSpace: "nowrap",
                          background: badge.bg,
                          color: badge.color,
                          border: badge.border
                        }}
                      >
                        {estadoActual}
                      </span>
                    </div>

                    {/* Título destacado */}
                    <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem", fontWeight: "600", color: "#f8fafc", lineHeight: "1.4" }}>
                      {rep.titulo || "Sin título"}
                    </h3>

                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                      {rep.zona && (
                        <span style={{ background: "#1e293b", color: "#cbd5e1", fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                          Zona: {rep.zona.nombre} ({rep.zona.nivelPeligro})
                        </span>
                      )}
                      {rep.categoria && (
                        <span style={{ background: "#1e293b", color: "#cbd5e1", fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                          Categoría: {rep.categoria.nombre}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones de estado */}
                  <div 
                    style={{ 
                      paddingTop: "0.75rem", 
                      borderTop: "1px solid #1e293b", 
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem"
                    }}
                  >
                    {estadoActual === "NO_VERIFICADO" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cambiarEstado(rep.idReporte, "EN_INVESTIGACION");
                        }}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          background: "#f59e0b1a",
                          color: "#f59e0b",
                          border: "1px solid #f59e0b33",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        Investigar
                      </button>
                    )}

                    {estadoActual === "EN_INVESTIGACION" && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/reporte/${rep.idReporte}`);
                          }}
                          style={{
                            flex: 1,
                            padding: "0.5rem",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            background: "#10b9811a",
                            color: "#10b981",
                            border: "1px solid #10b98133",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                        >
                          Resolver
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cambiarEstado(rep.idReporte, "NO_VERIFICADO");
                          }}
                          style={{
                            flex: 1,
                            padding: "0.5rem",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            background: "#1e293b",
                            color: "#94a3b8",
                            border: "1px solid #334155",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                        >
                          Volver a No Verificado
                        </button>
                      </div>
                    )}

                    {estadoActual === "RESUELTO" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "100%",
                            padding: "0.25rem",
                            fontSize: "0.8rem",
                            color: "#10b981",
                            textAlign: "center",
                            fontWeight: "500"
                          }}
                        >
                          Caso Finalizado
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/reporte/${rep.idReporte}`);
                          }}
                          style={{
                            width: "100%",
                            padding: "0.4rem",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            background: "#1e293b",
                            color: "#94a3b8",
                            border: "1px solid #334155",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                        >
                          Ver resolución
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default InvestigadorPanel;
