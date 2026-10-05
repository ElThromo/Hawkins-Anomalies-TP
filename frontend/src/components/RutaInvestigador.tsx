
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface Props {
  children: ReactNode;
}

function RutaInvestigador({ children }: Props) {
  const { usuario } = useAuth();

  const rol = (usuario?.rol || "").toUpperCase();

  // Permite el acceso tanto a INVESTIGADOR como a ADMIN
  if (!usuario || (rol !== "INVESTIGADOR" && rol !== "ADMIN")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default RutaInvestigador;
