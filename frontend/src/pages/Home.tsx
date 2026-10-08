
import TopInvestigadores from "../components/TopInvestigadores";
import MiniMapa from "../components/MiniMapa";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import "../styles/Home.css";
import fondoHero from "../assets/homebackground.png"

interface Reporte {
  idReporte: number;
  titulo: string;
  cuerpo: string;
  fechaHora: string;
  estado: string;
  zona: { nombre: string; nivelPeligro: string };
  categoria: { nombre: string };
  imagenes: { idImagen: number; url: string }[];
}

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

function elegirDestacada(reportes: Reporte[], fecha: string) {
  const inicioDelDia = new Date(`${fecha}T00:00:00-03:00`).getTime();

  const candidatos = reportes
    .filter((reporte) => new Date(reporte.fechaHora).getTime() < inicioDelDia)
    .sort((a, b) => a.idReporte - b.idReporte);

  if (candidatos.length === 0) return null;

  const numeroDia = Math.floor(inicioDelDia / 86400000);
  return candidatos[numeroDia % candidatos.length];
}

function Home() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [fechaDelDia] = useState(() =>
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date())
  );
      const destacada = elegirDestacada(reportes, fechaDelDia);

    const [indiceFoto, setIndiceFoto] = useState(0);
  const fotosDestacadas = destacada?.imagenes ?? [];
  const indiceActual =
    fotosDestacadas.length > 0
      ? indiceFoto % fotosDestacadas.length
      : 0;

  const fotoDestacada = fotosDestacadas[indiceActual]?.url;

  function cambiarFoto(direccion: number) {
    const cantidad = fotosDestacadas.length;
    if (cantidad < 2) return;

    setIndiceFoto(
      (actual) => (actual + direccion + cantidad) % cantidad
    );
  }

  useEffect(() => {
    async function cargarReportes() {
      try {
        const respuesta = await fetch(`${API_URL}/reportes`);

        if (!respuesta.ok) {
          setError("No se pudieron cargar los reportes");
          return;
        }

        const datos = await respuesta.json();
        setReportes(datos);
      } catch (err) {
        console.error(err);
        setError("No se pudo conectar con el servidor");
      } finally {
        setCargando(false);
      }
    }

    cargarReportes();
  }, []);


  const recientes = reportes.slice(0, 5);

  const peligrosos = reportes
    .filter((r) => r.zona.nivelPeligro === "CRITICO")
    .slice(0, 5);

  return (
    <Layout>
      <img src={fondoHero} alt="" className="inicio-fondo-glow" />
      <div className="inicio-contenido">
      <header className="inicio-encabezado">
        <h1>
          <img
            src="/ha_logo.PNG"
            alt="Hawkins Anomalies"
            className="inicio-logo"
          />
        </h1>
      </header>
      <header>
        <h4>Inicio</h4>
        <h3>Bienvenido a Hawkins Anomalies</h3>
      </header>

      <section className="cards">
                <article className="card inicio-destacada">
          <h2>Anomalía destacada del día</h2>

          {cargando && <p>Cargando...</p>}
          {error && <p className="card-error">{error}</p>}

          {!cargando && !error && !destacada && (
            <p>
              Todavía no hay una anomalía destacada. Los reportes nuevos
              participan a partir del día siguiente.
            </p>
          )}

          {!cargando && !error && destacada && (
            <div className="inicio-destacada-contenido">
                            <div className="inicio-destacada-galeria">
                {fotoDestacada ? (
                  <img
                    className="inicio-destacada-foto"
                    src={new URL(fotoDestacada, `${API_URL}/`).href}
                    alt={`Foto ${indiceActual + 1} de ${destacada.titulo}`}
                  />
                ) : (
                  <div className="inicio-destacada-sin-foto">
                    Sin imagen
                  </div>
                )}

                {fotosDestacadas.length > 1 && (
                  <div className="inicio-galeria-controles">
                    <button
                      type="button"
                      className="inicio-galeria-flecha"
                      onClick={() => cambiarFoto(-1)}
                      aria-label="Foto anterior"
                    >
                      ‹
                    </button>

                    <span
                      className="inicio-galeria-contador"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {indiceActual + 1} / {fotosDestacadas.length}
                    </span>

                    <button
                      type="button"
                      className="inicio-galeria-flecha"
                      onClick={() => cambiarFoto(1)}
                      aria-label="Foto siguiente"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              <div className="inicio-destacada-info">
                <p className="inicio-destacada-etiquetas">
                  {destacada.zona.nombre} · {destacada.categoria.nombre}
                </p>

                <h3>{destacada.titulo}</h3>

                <p className="inicio-destacada-resumen">
                  {destacada.cuerpo}
                </p>

                <Link
                  className="inicio-boton inicio-destacada-enlace"
                  to={`/reporte/${destacada.idReporte}`}
                >
                  Ver reporte
                </Link>
              </div>
            </div>
          )}
                </article>

        <MiniMapa />

        <div className="card">
          <h2>Reportes recientes</h2>

          {cargando && <p>Cargando...</p>}
          {error && <p className="card-error">{error}</p>}

          {!cargando && !error && recientes.length === 0 && (
            <p>No hay reportes.</p>
          )}

          {!cargando && !error && recientes.length > 0 && (
            <ul className="lista-reportes">
              {recientes.map((reporte) => (
                <li key={reporte.idReporte}>
                  <Link to={`/reporte/${reporte.idReporte}`}>
                    <span className="reporte-titulo">{reporte.titulo}</span>
                    <span className="reporte-sub">{reporte.zona.nombre} · {reporte.categoria.nombre}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <TopInvestigadores />
        <div className="card">
          <h2>Reportes peligrosos</h2>

          {cargando && <p>Cargando...</p>}
          {error && <p className="card-error">{error}</p>}

          {!cargando && !error && peligrosos.length === 0 && (
            <p>Sin actividad.</p>
          )}

          {!cargando && !error && peligrosos.length > 0 && (
            <ul className="lista-reportes">
              {peligrosos.map((reporte) => (
                <li key={reporte.idReporte}>
                  <Link to={`/reporte/${reporte.idReporte}`}>
                    <span className="reporte-titulo">{reporte.titulo}</span>
                    <span className="reporte-sub">{reporte.zona.nombre} · Crítico</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      </div>
    </Layout>
  );
}

export default Home;
