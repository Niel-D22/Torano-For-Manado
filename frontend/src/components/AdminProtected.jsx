import { Navigate } from "react-router-dom";
import { getAdminToken } from "../lib/adminApi";

// Route admin: butuh token admin, kalau tidak → ke halaman login admin.
const AdminProtected = ({ children }) =>
  getAdminToken() ? children : <Navigate to="/admin/login" replace />;

export default AdminProtected;
