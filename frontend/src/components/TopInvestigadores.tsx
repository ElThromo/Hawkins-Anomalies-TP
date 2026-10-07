
import { useEffect, useState } from "react";

interface Investigador {
  idUsuario: number;
  nombre: string;
  avatar: string | null;
  reportesResueltos: number;
}

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

function TopInvestigadores() {
  const [investigadores, setInvestigadores] = useState<Investigador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const [avataresFallidos, setAvataresFallidos] = useState<number[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarRanking() {
      setCargando(true);
      setError("");

      try {
        const respuesta = await fetch(
          `${API_URL}/resoluciones/top-investigadores`,
          { signal: controller.signal }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo cargar el ranking.");
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error("El servidor devolvió una respuesta inesperada.");
        }

        if (!controller.signal.aborted) {
          setInvestigadores(datos);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "No se pudo conectar con el servidor."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarRanking();

    return () => controller.abort();
  }, [intento]);

  return (
    <article className="card inicio-top">
      <h2>Top investigadores</h2>
      <p className="inicio-top-subtitulo">
        Quienes más reportes resolvieron.
      </p>

      {cargando && <p>Cargando investigadores...</p>}

      {!cargando && error && (
        <div role="alert">
          <p className="card-error">{error}</p>
          <button
            type="button"
            className="inicio-boton"
            onClick={() => setIntento((actual) => actual + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && investigadores.length === 0 && (
        <p className="inicio-top-vacio">
          Todavía no hay investigadores con reportes resueltos.
        </p>
      )}

      {!cargando && !error && investigadores.length > 0 && (
        <ol className="inicio-top-lista">
          {investigadores.map((investigador, indice) => (
            <li key={investigador.idUsuario} className="inicio-top-item">
              <span className="inicio-top-puesto" aria-hidden="true">
                {indice + 1}
              </span>

              <div className="inicio-top-avatar" aria-hidden="true">
                {investigador.avatar &&
                !avataresFallidos.includes(investigador.idUsuario) ? (
                  <img
                    src={new URL(investigador.avatar, `${API_URL}/`).href}
                    alt=""
                    onError={() =>
                      setAvataresFallidos((actuales) =>
                        actuales.includes(investigador.idUsuario)
                          ? actuales
                          : [...actuales, investigador.idUsuario]
                      )
                    }
                  />
                ) : (
                  investigador.nombre.charAt(0).toUpperCase()
                )}
              </div>

              <div className="inicio-top-datos">
                <strong>{investigador.nombre}</strong>
                <span>
                  {investigador.reportesResueltos}{" "}
                  {investigador.reportesResueltos === 1
                    ? "reporte resuelto"
                    : "reportes resueltos"}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

export default TopInvestigadores;
