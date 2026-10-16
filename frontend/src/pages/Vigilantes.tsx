import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import "../styles/AdminTable.css";

interface Vigilante {
  idVigilante?: number;
  nombre: string;
  idZona?: number | string;
}

interface Zona {
  idZona: number;
  nombre: string;
}

export const Vigilantes = () => {
  const API_URL = "http://localhost:3000/vigilantes";
  const ZONAS_URL = "http://localhost:3000/zonas";

  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [zonaFiltro, setZonaFiltro] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [vigilanteEditando, setVigilanteEditando] = useState<Vigilante | null>(null);

  const [nombre, setNombre] = useState("");
  const [idZona, setIdZona] = useState<number | string>("");

  const [vigilanteAEliminar, setVigilanteAEliminar] = useState<Vigilante | null>(null);
  const [errorEliminacion, setErrorEliminacion] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const cargarZonas = async () => {
    try {
      const response = await fetch(ZONAS_URL, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setZonas(data);
      } else {
        console.error("Error al obtener las zonas:", response.statusText);
      }
    } catch (error) {
      console.error("Error de conexión al cargar zonas:", error);
    }
  };

  const cargarVigilantes = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setVigilantes(data);
      } else {
        console.error("Error al obtener vigilantes:", response.statusText);
      }
    } catch (error) {
      console.error("Error de conexión al cargar vigilantes:", error);
    }
  };

  useEffect(() => {
    cargarZonas();
    cargarVigilantes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre,
      idZona: Number(idZona),
    };

    try {
      if (vigilanteEditando && vigilanteEditando.idVigilante) {
        await fetch(`${API_URL}/${vigilanteEditando.idVigilante}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      setModalAbierto(false);
      cargarVigilantes();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleIniciarEliminacion = (vigilante: Vigilante) => {
    setErrorEliminacion("");
    setVigilanteAEliminar(vigilante);
  };

  const confirmarYEjecutarEliminacion = async () => {
    if (!vigilanteAEliminar || !vigilanteAEliminar.idVigilante) return;
    setErrorEliminacion("");

    try {
      const response = await fetch(`${API_URL}/${vigilanteAEliminar.idVigilante}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const datos = await response.json().catch(() => null);
        setErrorEliminacion(datos?.error || "Error al eliminar el vigilante");
        return;
      }

      setVigilanteAEliminar(null);
      cargarVigilantes();
    } catch (error) {
      console.error("Error al eliminar:", error);
      setErrorEliminacion("No se pudo conectar con el servidor");
    }
  };

  const handleNuevoVigilante = () => {
    setVigilanteEditando(null);
    setNombre("");
    setIdZona("");
    setModalAbierto(true);
  };

  const handleEditar = (v: Vigilante) => {
    setVigilanteEditando(v);
    setNombre(v.nombre);
    setIdZona(v.idZona !== undefined && v.idZona !== null ? String(v.idZona) : "");
    setModalAbierto(true);
  };

  const obtenerNombreZona = (idZona?: number | string) => {
    if (!idZona) return "Sin asignar";
    const zonaEncontrada = zonas.find((z) => String(z.idZona) === String(idZona));
    return zonaEncontrada ? zonaEncontrada.nombre : `Zona ID ${idZona}`;
  };

  const vigilantesFiltrados = vigilantes.filter((v) => {
    const coincideTexto = (v.nombre || "").toLowerCase().includes(busqueda.toLowerCase());
    const coincideZona = zonaFiltro === "" || String(v.idZona) === zonaFiltro;
    return coincideTexto && coincideZona;
  });

  return (
    <Layout>
      <div className="header-section">
        <h2>Gestión de Vigilantes</h2>
        <button className="btn-primary" onClick={handleNuevoVigilante}>
          + Nuevo Vigilante
        </button>
      </div>

      <div className="crud-tools">
        <input
          type="text"
          placeholder="Buscar vigilante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={zonaFiltro} onChange={(e) => setZonaFiltro(e.target.value)}>
          <option value="">Todas las zonas</option>
          {zonas.map((z) => (
            <option key={z.idZona} value={String(z.idZona)}>
              {z.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Zona Asignada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vigilantesFiltrados.length > 0 ? (
              vigilantesFiltrados.map((v) => (
                <tr key={v.idVigilante}>
                  <td>{v.idVigilante}</td>
                  <td>{v.nombre}</td>
                  <td>{obtenerNombreZona(v.idZona)}</td>
                  <td>
                    <button className="btn-action" onClick={() => handleEditar(v)}>
                      Editar
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleIniciarEliminacion(v)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                  No se encontraron vigilantes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{vigilanteEditando ? "Editar Vigilante" : "Nuevo Vigilante"}</h3>
            <form onSubmit={handleSubmit}>
              <label>
                Nombre
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </label>

              <label>
                Zona Asignada
                <select
                  required
                  value={String(idZona)}
                  onChange={(e) => setIdZona(e.target.value)}
                >
                  <option value="">Selecciona una zona</option>
                  {zonas.map((z) => (
                    <option key={z.idZona} value={String(z.idZona)}>
                      {z.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modal-acciones">
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {vigilanteAEliminar && (
        <div className="modal-overlay" onClick={() => setVigilanteAEliminar(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Eliminación</h3>
            <p className="modal-subtitulo" style={{ margin: "1rem 0" }}>
              ¿Estás seguro de que deseas eliminar al vigilante{" "}
              <strong>{vigilanteAEliminar.nombre}</strong>? Esta acción no se puede
              deshacer.
            </p>

            {errorEliminacion && (
              <p
                className="admin-mensaje admin-error"
                style={{ marginBottom: "1rem", fontSize: "0.9rem" }}
              >
                {errorEliminacion}
              </p>
            )}

            <div className="modal-acciones">
              {errorEliminacion ? (
                <button
                  className="btn-secundario"
                  onClick={() => setVigilanteAEliminar(null)}
                >
                  Cerrar
                </button>
              ) : (
                <>
                  <button
                    className="btn-secundario"
                    onClick={() => setVigilanteAEliminar(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-primary btn-eliminar"
                    onClick={confirmarYEjecutarEliminacion}
                  >
                    Sí, eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Vigilantes;