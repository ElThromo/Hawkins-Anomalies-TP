
import { useEffect, useState } from "react";

interface Contribuyente {
  idUsuario: number;
  nombre: string;
  avatar: string | null;
  reportesCreados: number;
}

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

function TopContribuyentes() {
  const [contribuyentes, setContribuyentes] = useState<Contribuyente[]>([]);
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
          `${API_URL}/usuarios/top-contribuyentes`,
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
          setContribuyentes(datos);
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
      <h2>Top contribuyentes</h2>
      <p className="inicio-top-subtitulo">
        Quienes más reportes crearon.
      </p>

      {cargando && <p>Cargando contribuyentes...</p>}

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

      {!cargando && !error && contribuyentes.length === 0 && (
        <p className="inicio-top-vacio">
          Todavía no hay contribuyentes con reportes creados.
        </p>
      )}

      {!cargando && !error && contribuyentes.length > 0 && (
        <ol className="inicio-top-lista">
          {contribuyentes.map((Contribuyente, indice) => (
            <li key={Contribuyente.idUsuario} className="inicio-top-item">
              <span className="inicio-top-puesto" aria-hidden="true">
                {indice + 1}
              </span>

              <div className="inicio-top-avatar" aria-hidden="true">
                {Contribuyente.avatar &&
                !avataresFallidos.includes(Contribuyente.idUsuario) ? (
                  <img
                    src={new URL(Contribuyente.avatar, `${API_URL}/`).href}
                    alt=""
                    onError={() =>
                      setAvataresFallidos((actuales) =>
                        actuales.includes(Contribuyente.idUsuario)
                          ? actuales
                          : [...actuales, Contribuyente.idUsuario]
                      )
                    }
                  />
                ) : (
                  Contribuyente.nombre.charAt(0).toUpperCase()
                )}
              </div>

              <div className="inicio-top-datos">
                <strong>{Contribuyente.nombre}</strong>
                <span>
                  {Contribuyente.reportesCreados}{" "}
                  {Contribuyente.reportesCreados === 1
                    ? "reporte creado"
                    : "reportes creados"}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

export default TopContribuyentes;
