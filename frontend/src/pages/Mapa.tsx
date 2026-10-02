import { useState, useEffect, useRef } from "react";
import { MapContainer, ImageOverlay, Circle, Marker, Popup } from "react-leaflet";
import L, { CRS, type Map as LeafletMap } from "leaflet";
import Layout from "../components/Layout/Layout";
import "leaflet/dist/leaflet.css";
import "../styles/Mapa.css";
import { ANCHO_IMAGEN, ALTO_IMAGEN, RADIO_DEFAULT, COLOR_NIVEL } from "../constants/mapa";

interface Zona {
  idZona: number;
  nombre: string;
  nivelPeligro: string;
  posX: number | null;
  posY: number | null;
  radio: number | null;
}

interface Reporte {
  idReporte: number;
  zona: { idZona: number };
}

function posicionBadge(centro: L.LatLngExpression, radio: number): L.LatLngExpression {
  const [lat, lng] = centro as [number, number];
  const offset = radio * Math.SQRT1_2; // equivale a radio * cos(45°) = radio * sen(45°)
  return [lat + offset, lng + offset];
}

function crearIconoBadge(cantidad: number) {
  return L.divIcon({
    className: "icono-badge-contenido",
    html: `<span class="icono-zona-badge">${cantidad}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}
function crearIconoZona(nombre: string) {
  return L.divIcon({
    className: "icono-zona-contenido",
    html: `
      <div class="icono-zona-wrapper">
        <span class="icono-zona-nombre">${nombre}</span>
      </div>
    `,
    iconSize: [100, 100],
    iconAnchor: [50, 50]
  });
}
function Mapa() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [conteoReportes, setConteoReportes] = useState<Record<number, number>>({});
  const [cargando, setCargando] = useState(true);
  const mapaRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      try {
        const [resZonas, resReportes] = await Promise.all([
          fetch("http://localhost:3000/zonas"),
          fetch("http://localhost:3000/reportes")
        ]);

        if (cancelado) return;

        const datosZonas: Zona[] = await resZonas.json();
        const datosReportes: Reporte[] = await resReportes.json();

        const conteo: Record<number, number> = {};
        datosReportes.forEach((r) => {
          conteo[r.zona.idZona] = (conteo[r.zona.idZona] || 0) + 1;
        });

        setZonas(datosZonas);
        setConteoReportes(conteo);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarDatos();
    return () => { cancelado = true; };
  }, []);

  const bounds: L.LatLngBoundsExpression = [[0, 0], [ALTO_IMAGEN, ANCHO_IMAGEN]];

  useEffect(() => {
    if (mapaRef.current) {
      mapaRef.current.fitBounds(bounds);
    }
  }, [cargando]);

  function coordenadasLeaflet(posX: number, posY: number): L.LatLngExpression {
    return [ALTO_IMAGEN - posY, posX];
  }

  return (
    <Layout>
      <header>
        <h1>Mapa de Hawkins</h1>
        <h2>Consulta el mapa de Hawkins interactivo y sus zonas</h2>
      </header> 
      {cargando && <p className="admin-mensaje">Cargando mapa...</p>}

      {!cargando && (
        <div className="mapa-contenedor">
          <MapContainer
            ref={mapaRef}
            crs={CRS.Simple}
            bounds={bounds}
            maxBounds={bounds}
            maxBoundsViscosity={1.0}
            zoomSnap={0.25}
            zoomDelta={0.5}
            wheelPxPerZoomLevel={200}
            minZoom={-3}
            maxZoom={3}
            zoomControl={false}
            attributionControl={false}
            className="mapa-leaflet"
          >
            <ImageOverlay url="/mapa-hawkins.png" bounds={bounds} />

            {zonas
                .filter((z) => z.posX !== null && z.posY !== null)
                .map((zona) => {
                  const posicion = coordenadasLeaflet(zona.posX!, zona.posY!);
                  const cantidad = conteoReportes[zona.idZona] || 0;
                  const radio = zona.radio ?? RADIO_DEFAULT;

                  return (
                    <div key={zona.idZona}>
                      <Circle
                        center={posicion}
                        radius={radio}
                        pathOptions={{
                          color: COLOR_NIVEL[zona.nivelPeligro],
                          fillColor: COLOR_NIVEL[zona.nivelPeligro],
                          fillOpacity: 0.4,
                          weight: 2
                        }}
                      >
                        <Popup>
                          <strong>{zona.nombre}</strong>
                          <br />
                          Nivel de peligro: {zona.nivelPeligro}
                          <br />
                          Reportes: {cantidad}
                        </Popup>
                      </Circle>

                      <Marker position={posicion} icon={crearIconoZona(zona.nombre)} interactive={false} />

                      {cantidad > 0 && (
                        <Marker position={posicionBadge(posicion, radio)} icon={crearIconoBadge(cantidad)} interactive={false} />
                      )}
                    </div>
                  );
                })}
          </MapContainer>
        </div>
      )}
    </Layout>
  );
}

export default Mapa;