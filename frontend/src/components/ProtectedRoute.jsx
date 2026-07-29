import { Navigate, useLocation } from "react-router-dom";
import { useAuth, homeForRole } from "../lib/auth";

// Membungkus route yang butuh login. `roles` (opsional) membatasi peran.
// `loginPath` menentukan halaman login yang dituju bila belum masuk.
const ProtectedRoute = ({ roles, loginPath = "/login", children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper text-moss">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-forest" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${loginPath}?next=${next}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Peran tidak sesuai → arahkan ke beranda perannya sendiri.
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
