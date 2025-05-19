// src/components/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-lg shadow-xl flex items-center space-x-4">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            Cargando...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Guarda la ubicación actual para redirigir después del login
    return (
      <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
    );
  }

  // Si hay children, renderízalos, si no, renderiza el Outlet
  return children ? <>{children}</> : <Outlet />;
};

// Componente para rutas que solo deben ser accesibles cuando NO hay sesión
export const PublicRoute = ({
  children,
  redirectTo = "/dashboard",
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-lg shadow-xl flex items-center space-x-4">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            Cargando...
          </span>
        </div>
      </div>
    );
  }

  if (user) {
    // Si hay un usuario autenticado, redirige a la ruta especificada
    return (
      <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
