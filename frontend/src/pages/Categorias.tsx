import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import "../styles/AdminTable.css";

interface Categoria {
  idCategoria?: number;
  nombre: string;
  descripcion: string;
}

export const Categorias = () => {
  const API_URL = "http://localhost:3000/categorias";

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null);
  const [errorEliminacion, setErrorEliminacion] = useState("");


  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const cargarCategorias = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      } else {
        console.error("Error al obtener las categorías:", response.statusText);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (categoriaEditando && categoriaEditando.idCategoria) {
        await fetch(`${API_URL}/${categoriaEditando.idCategoria}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ nombre, descripcion }),
        });
      } else {

        await fetch(API_URL, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ nombre, descripcion }),
        });
      }

      setModalAbierto(false);
      cargarCategorias();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleIniciarEliminacion = (categoria: Categoria) => {
    setErrorEliminacion("");
    setCategoriaAEliminar(categoria);
  };

  const confirmarYEjecutarEliminacion = async () => {
    if (!categoriaAEliminar || !categoriaAEliminar.idCategoria) return;
    setErrorEliminacion("");

    try {
      const response = await fetch(`${API_URL}/${categoriaAEliminar.idCategoria}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const datos = await response.json().catch(() => null);
        setErrorEliminacion(datos?.error || "Error al eliminar la categoría");
        return;
      }

      setCategoriaAEliminar(null);
      cargarCategorias();
    } catch (error) {
      console.error("Error al eliminar:", error);
      setErrorEliminacion("No se pudo conectar con el servidor");
    }
  };

  const handleNuevaCategoria = () => {
    setCategoriaEditando(null);
    setNombre("");
    setDescripcion("");
    setModalAbierto(true);
  };

  const handleEditar = (cat: Categoria) => {
    setCategoriaEditando(cat);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion);
    setModalAbierto(true);
  };

  const categoriasFiltradas = categorias.filter(
    (cat) =>
      cat.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cat.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Layout>
      <div className="header-section">
        <h2>Gestión de Categorías</h2>
        <button className="btn-primary" onClick={handleNuevaCategoria}>
          + Nueva Categoría
        </button>
      </div>

      <div className="crud-tools">
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasFiltradas.length > 0 ? (
              categoriasFiltradas.map((cat) => (
                <tr key={cat.idCategoria}>
                  <td>{cat.idCategoria}</td>
                  <td>{cat.nombre}</td>
                  <td>{cat.descripcion}</td>
                  <td>
                    <button className="btn-action" onClick={() => handleEditar(cat)}>
                      Editar
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleIniciarEliminacion(cat)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                  No se encontraron categorías.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{categoriaEditando ? "Editar Categoría" : "Nueva Categoría"}</h3>
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
                Descripción
                <textarea
                  required
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
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

      {categoriaAEliminar && (
        <div className="modal-overlay" onClick={() => setCategoriaAEliminar(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Eliminación</h3>
            <p className="modal-subtitulo" style={{ margin: "1rem 0" }}>
              ¿Estás seguro de que deseas eliminar la categoría{" "}
              <strong>{categoriaAEliminar.nombre}</strong>? Esta acción no se puede
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
                  onClick={() => setCategoriaAEliminar(null)}
                >
                  Cerrar
                </button>
              ) : (
                <>
                  <button
                    className="btn-secundario"
                    onClick={() => setCategoriaAEliminar(null)}
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

export default Categorias;