
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface TipoReaccion {
  idTipoReaccion: number;
  nombre: string;
  emoji: string;
}

interface Reaccion {
  idReaccion: number;
  idUsuario: number;
  idTipoReaccion: number;
  tipoReaccion: {
    nombre: string;
    emoji: string;
  };
}

interface Props {
  idReporte: number;
  iniciales: Reaccion[];
}

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export default function ReaccionesFeed({ idReporte, iniciales }: Props) {
  const { usuario, token } = useAuth();
  const [reacciones, setReacciones] = useState(iniciales);
  const [tipos, setTipos] = useState<TipoReaccion[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const bloqueo = useRef(false);

  const miReaccion = reacciones.find(
    (reaccion) => reaccion.idUsuario === usuario?.idUsuario
  );

  const resumen = new Map<
    number,
    { nombre: string; emoji: string; cantidad: number }
  >();

  for (const reaccion of reacciones) {
    resumen.set(reaccion.idTipoReaccion, {
      ...reaccion.tipoReaccion,
      cantidad: (resumen.get(reaccion.idTipoReaccion)?.cantidad ?? 0) + 1
    });
  }

  async function abrirSelector() {
    if (bloqueo.current) return;

    if (abierto) {
      setAbierto(false);
      return;
    }

    setError("");

    if (tipos.length > 0) {
      setAbierto(true);
      return;
    }

    bloqueo.current = true;
    setOcupado(true);

    try {
      const respuesta = await fetch(`${API_URL}/tipos-reaccion`);
      const datos = await respuesta.json();

      if (!respuesta.ok || !Array.isArray(datos)) {
        throw new Error("No se pudieron cargar los emojis.");
      }

      if (datos.length === 0) {
        throw new Error("Todavía no hay emojis disponibles.");
      }

      setTipos(datos);
      setAbierto(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo conectar."
      );
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }

  async function reaccionar(idTipoReaccion: number) {
    if (!usuario || !token || bloqueo.current) return;

    bloqueo.current = true;
    setOcupado(true);
    setError("");

    const quitar = miReaccion?.idTipoReaccion === idTipoReaccion;
    const metodo = quitar ? "DELETE" : miReaccion ? "PUT" : "POST";
    const ruta = miReaccion
      ? `/reacciones/${miReaccion.idReaccion}`
      : "/reacciones";

    try {
      const respuesta = await fetch(`${API_URL}${ruta}`, {
        method: metodo,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: quitar
          ? undefined
          : JSON.stringify({ idReporte, idTipoReaccion })
      });

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        throw new Error(datos?.error || "No se pudo guardar la reacción.");
      }

      if (!quitar && !datos?.reaccion?.tipoReaccion) {
        throw new Error("Recargá la página para actualizar las reacciones.");
      }

      setReacciones((actuales) => {
        const otras = actuales.filter(
          (reaccion) => reaccion.idUsuario !== usuario.idUsuario
        );

        return quitar ? otras : [...otras, datos.reaccion];
      });

      setAbierto(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo conectar."
      );
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }

  return (
    <div className="feed-reacciones-bloque">
      <div className="feed-reacciones">
        {Array.from(resumen, ([id, reaccion]) => (
          <button
            key={id}
            type="button"
            title={reaccion.nombre}
            aria-label={`${reaccion.nombre}: ${reaccion.cantidad}`}
            aria-pressed={miReaccion?.idTipoReaccion === id}
            disabled={ocupado || !usuario || !token}
            onClick={() => reaccionar(id)}
          >
            {reaccion.emoji} {reaccion.cantidad}
          </button>
        ))}

        {usuario && token ? (
          <button
            type="button"
            aria-expanded={abierto}
            disabled={ocupado}
            onClick={abrirSelector}
          >
            {ocupado ? "Cargando…" : abierto ? "Cerrar" : "☺ Reaccionar"}
          </button>
        ) : (
          <Link to="/login">Iniciá sesión para reaccionar</Link>
        )}
      </div>

      {abierto && (
        <div className="feed-selector-emojis" aria-label="Elegí una reacción">
          {tipos.map((tipo) => (
            <button
              key={tipo.idTipoReaccion}
              type="button"
              title={tipo.nombre}
              aria-label={tipo.nombre}
              aria-pressed={miReaccion?.idTipoReaccion === tipo.idTipoReaccion}
              disabled={ocupado}
              onClick={() => reaccionar(tipo.idTipoReaccion)}
            >
              {tipo.emoji}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="feed-reacciones-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
