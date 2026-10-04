import "./Sidebar.css";
import { Link } from "react-router-dom";
import { useSidebar } from "../../context/useSidebar";
import { useAuth } from "../../context/useAuth";

function Sidebar() {
  const { usuario } = useAuth();
  const { abierta, cerrarSidebar } = useSidebar();

  const rol = (usuario?.rol || usuario?.role || "").toUpperCase();

  function cerrarSidebarSiEsMobile() {
    if (window.innerWidth < 768) {
      cerrarSidebar();
    }
  }

  return (
    <>
      <div className={`sidebar-overlay ${abierta ? "overlay-visible" : ""}`} onClick={cerrarSidebar} />

      <aside className={`sidebar ${abierta ? "sidebar-abierta" : "sidebar-cerrada"}`}>
        <h1 className="logo">Hawkins Anomalies</h1>

        <nav>
          <Link to="/" onClick={cerrarSidebarSiEsMobile}>
            <span className="nav-icon icon-inicio" />
            Inicio
          </Link>
          <Link to="/reportes" onClick={cerrarSidebarSiEsMobile}>
            <span className="nav-icon icon-reporte" />
            Reporte
          </Link>
          <Link to="/mapa" onClick={cerrarSidebarSiEsMobile}>
            <span className="nav-icon icon-mapa" />
            Mapa
          </Link>
        </nav>

        {/* Sección inferior con accesos especiales por rol */}
        <div className="sidebar-bottom">
          {rol === "INVESTIGADOR" && (
            <div className="sidebar-admin">
              <Link to="/investigador" onClick={cerrarSidebarSiEsMobile} className="sidebar-admin-link">
                <span className="nav-icon icon-investigador" />
                Investigador panel
              </Link>
            </div>
          )}

          {rol === "ADMIN" && (
            <div className="sidebar-admin">
              <Link to="/admin" onClick={cerrarSidebarSiEsMobile} className="sidebar-admin-link">
                <span className="nav-icon icon-paneladmin" />
                Admin panel
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;