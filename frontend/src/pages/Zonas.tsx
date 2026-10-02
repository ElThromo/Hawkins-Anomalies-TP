import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/useAuth";
import "../styles/AdminTable.css";
import { ANCHO_IMAGEN, ALTO_IMAGEN, COLOR_NIVEL } from "../constants/mapa";

type Zona = {
  idZona: number;
  nombre: string;
  descripcion: string;
  nivelPeligro: string;
  posX: number | null;
  posY: number | null;
  radio: number | null;
};

const NIVELES = [
  { nombre: "BAJO", color: "#42c76b" },
  { nombre: "MEDIO", color: "#e6c44a" },
  { nombre: "ALTO", color: "#f28c45" },
  { nombre: "CRITICO", color: "#e84b5b" },
];

function colorDelNivel(nivel: string) {
  return NIVELES.find((n) => n.nombre === nivel)?.color ?? "#d1d1d1";
}

function Zonas() {
  const { token } = useAuth();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [zonaEditando, setZonaEditando] = useState<Zona | "nueva" | null>(null);

  async function cargarZonas() {
    setCargando(true);
    try {
      const respuesta = await fetch("http://localhost:3000/zonas");
      if (!respuesta.ok) {
        setError("No se pudieron cargar las zonas");
        return;
      }
      setZonas(await respuesta.json());
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let cancelado = false;

    async function cargarZonasEfecto() {
      setCargando(true);
      try {
        const respuesta = await fetch("http://localhost:3000/zonas");
        if (cancelado) return;
        if (!respuesta.ok) {
          setError("No se pudieron cargar las zonas");
          return;
        }
        setZonas(await respuesta.json());
      } catch (err) {
        if (!cancelado) {
          console.error(err);
          setError("No se pudo conectar con el servidor");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarZonasEfecto();
    return () => {
      cancelado = true;
    };
  }, []);

async function handleGuardar(datos: { nombre: string; descripcion: string; nivelPeligro: string; posX: number; posY: number; radio: number }) {
  const esNueva = zonaEditando === "nueva";
  const url = esNueva
    ? "http://localhost:3000/zonas"
    : `http://localhost:3000/zonas/${(zonaEditando as Zona).idZona}`;

  try {
    const respuesta = await fetch(url, {
      method: esNueva ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
      const err = await respuesta.json();
      alert(err.error || "Error al guardar la zona");
      return;
    }

    setZonaEditando(null);
    cargarZonas();
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar con el servidor");
  }
}

  async function handleEliminar(zona: Zona) {
    const confirmar = window.confirm(`¿Eliminar la zona "${zona.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    try {
      const respuesta = await fetch(`http://localhost:3000/zonas/${zona.idZona}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!respuesta.ok) {
        const err = await respuesta.json();
        alert(err.error || "Error al eliminar la zona");
        return;
      }

      cargarZonas();
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar con el servidor");
    }
  }

  const zonasFiltradas = zonas.filter((z) =>
    z.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Layout>
      <div className="header-section">
        <h2>Gestión de Zonas</h2>
        <button className="btn-primary" onClick={() => setZonaEditando("nueva")}>
          + Nueva Zona
        </button>
      </div>

      <div className="crud-tools">
        <input
          type="text"
          placeholder="Buscar zona..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {cargando && <p className="admin-mensaje">Cargando...</p>}
      {error && <p className="admin-mensaje admin-error">{error}</p>}

      {!cargando && !error && (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Nivel de peligro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {zonasFiltradas.map((zona) => (
                <tr key={zona.idZona}>
                  <td>{zona.idZona}</td>
                  <td>{zona.nombre}</td>
                  <td>{zona.descripcion}</td>
                  <td>
                    <span className="badge-nivel" style={{ color: colorDelNivel(zona.nivelPeligro) }}>
                      ● {zona.nivelPeligro}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action" onClick={() => setZonaEditando(zona)}>
                      Editar
                    </button>
                    <button className="btn-action btn-delete" onClick={() => handleEliminar(zona)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {zonasFiltradas.length === 0 && (
            <p className="admin-mensaje">No se encontraron zonas.</p>
          )}
        </div>
      )}

      {zonaEditando && (
        <ModalZona
          zona={zonaEditando === "nueva" ? null : zonaEditando}
          onCancelar={() => setZonaEditando(null)}
          onGuardar={handleGuardar}
        />
      )}
    </Layout>
  );
}

interface ModalZonaProps {
  zona: Zona | null;
  onCancelar: () => void;
  onGuardar: (datos: { nombre: string; descripcion: string; nivelPeligro: string; posX: number; posY: number; radio: number }) => void;
}

function ModalZona({ zona, onCancelar, onGuardar }: ModalZonaProps) {
  const [nombre, setNombre] = useState(zona?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(zona?.descripcion ?? "");
  const [nivelPeligro, setNivelPeligro] = useState(zona?.nivelPeligro ?? "BAJO");
  const [posX, setPosX] = useState(zona?.posX ?? 0);
  const [posY, setPosY] = useState(zona?.posY ?? 0);
  const [radio, setRadio] = useState(zona?.radio ?? 50);

  function handleSubmit() {
    if (!nombre.trim() || !descripcion.trim()) {
      alert("Completá nombre y descripción");
      return;
    }
    onGuardar({ nombre, descripcion, nivelPeligro, posX, posY, radio });
  }

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box modal-box-con-preview" onClick={(e) => e.stopPropagation()}>
        <div className="modal-columna-form">
          <h3>{zona ? "Editar zona" : "Nueva zona"}</h3>

          <label>
            Nombre
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>

          <label>
            Descripción
            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </label>

          <label>
            Nivel de peligro
            <select value={nivelPeligro} onChange={(e) => setNivelPeligro(e.target.value)}>
              {NIVELES.map((n) => (
                <option key={n.nombre} value={n.nombre}>{n.nombre}</option>
              ))}
            </select>
          </label>

          <label>
            Posición X (píxeles en la imagen)
            <input type="number" value={posX ?? 0} onChange={(e) => setPosX(Number(e.target.value))} />
          </label>

          <label>
            Posición Y (píxeles en la imagen)
            <input type="number" value={posY ?? 0} onChange={(e) => setPosY(Number(e.target.value))} />
          </label>

          <label>
            Radio (tamaño del círculo)
            <input type="number" value={radio ?? 50} onChange={(e) => setRadio(Number(e.target.value))} />
          </label>

          <div className="modal-acciones">
            <button className="btn-secundario" onClick={onCancelar}>Cancelar</button>
            <button className="btn-primary" onClick={handleSubmit}>Guardar</button>
          </div>
        </div>

        <div className="modal-columna-preview">
          <p className="preview-label">Vista previa</p>
          <VistaPreviaMapa posX={posX} posY={posY} radio={radio} nivelPeligro={nivelPeligro} />
        </div>
      </div>
    </div>
  );
}

/* preview del mapa al crear/editar zona*/

const ANCHO_PREVIEW = 650;
const ALTO_PREVIEW = Math.round((ALTO_IMAGEN / ANCHO_IMAGEN) * ANCHO_PREVIEW);
const ESCALA = ANCHO_PREVIEW / ANCHO_IMAGEN;

interface VistaPreviaMapaProps {
  posX: number;
  posY: number;
  radio: number;
  nivelPeligro: string;
}

function VistaPreviaMapa({ posX, posY, radio, nivelPeligro }: VistaPreviaMapaProps) {
  const diametroPx = radio * 2 * ESCALA;
  const leftPx = posX * ESCALA - diametroPx / 2;
  const topPx = posY * ESCALA - diametroPx / 2;
  const color = COLOR_NIVEL[nivelPeligro] ?? "#999";

  return (
    <div className="vista-previa-mapa" style={{ width: ANCHO_PREVIEW, height: ALTO_PREVIEW }}>
      <img src="/mapa-hawkins.png" alt="Vista previa del mapa" />
      <div
        className="vista-previa-circulo"
        style={{
          width: diametroPx,
          height: diametroPx,
          left: leftPx,
          top: topPx,
          backgroundColor: `${color}66`,
          borderColor: color
        }}
      />
    </div>
  );
}

export default Zonas;