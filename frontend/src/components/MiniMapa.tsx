
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, ImageOverlay, Circle, Popup } from "react-leaflet";
import { CRS, type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ANCHO_IMAGEN,
  ALTO_IMAGEN,
  RADIO_DEFAULT,
  COLOR_NIVEL
} from "../constants/mapa";

interface Zona {
  idZona: number;
  nombre: string;
  nivelPeligro: string;
  posX: number | null;
  posY: number | null;
  radio: number | null;
}

const limites: LatLngBoundsExpression = [
  [0, 0],
  [ALTO_IMAGEN, ANCHO_IMAGEN]
];

function MiniMapa() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function cargarZonas() {
      try {
        const apiUrl = (
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        ).replace(/\/$/, "");

        const respuesta = await fetch(`${apiUrl}/zonas`, {
          signal: controller.signal
        });

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las zonas.");
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error("La respuesta del mapa no es válida.");
        }

        if (!controller.signal.aborted) {
          setZonas(datos);
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

    cargarZonas();

    return () => controller.abort();
  }, []);

  const zonasUbicadas = zonas.filter(
    (zona) =>
      zona.posX !== null &&
      zona.posY !== null &&
      Number.isFinite(zona.posX) &&
      Number.isFinite(zona.posY)
  );

  return (
    <article className="card inicio-mini-mapa">
      <div className="inicio-mini-mapa-cabecera">
        <h2>Mini mapa de Hawkins</h2>
        <Link to="/mapa" className="inicio-boton">
  Ver mapa completo
</Link>
      </div>

      {cargando && <p>Cargando mapa...</p>}

      {!cargando && error && (
        <p className="card-error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          <MapContainer
            crs={CRS.Simple}
            bounds={limites}
            maxBounds={limites}
            maxBoundsViscosity={1}
            minZoom={-4}
            maxZoom={2}
            zoomSnap={0.25}
            scrollWheelZoom={false}
            attributionControl={false}
            className="inicio-mini-mapa-lienzo"
          >
            <ImageOverlay
              url="/mapa-hawkins.png"
              bounds={limites}
            />

            {zonasUbicadas.map((zona) => (
              <Circle
                key={zona.idZona}
                center={[ALTO_IMAGEN - zona.posY!, zona.posX!]}
                radius={zona.radio ?? RADIO_DEFAULT}
                pathOptions={{
                  color: COLOR_NIVEL[zona.nivelPeligro] ?? "#aaa",
                  fillOpacity: 0.45,
                  weight: 2
                }}
              >
                <Popup>
                  <strong>{zona.nombre}</strong>
                  <br />
                  Peligro: {zona.nivelPeligro}
                </Popup>
              </Circle>
            ))}
          </MapContainer>

          <p className="inicio-mini-mapa-ayuda">
            {zonasUbicadas.length > 0
              ? "Tocá una zona para ver su información."
              : "Todavía no hay zonas ubicadas en el mapa."}
          </p>
        </>
      )}
    </article>
  );
}

export default MiniMapa;
