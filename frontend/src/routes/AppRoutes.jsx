import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import SearchResults from "../pages/SearchResults";
import MapPage from "../pages/MapPage";
import WorkerProfile from "../pages/WorkerProfile";
import ChatInbox from "../pages/ChatInbox";
import ChatRoom from "../pages/ChatRoom";
import WorkerLayout from "../layouts/WorkerLayout";
import Dashboard from "../pages/worker/Dashboard";
import Soon from "../pages/worker/Soon";
import AdminLayout from "../layouts/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import AdminLogin from "../pages/admin/AdminLogin";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminProtected from "../components/AdminProtected";
import Login from "../pages/Login";
import MasukPilihPeran from "../pages/MasukPilihPeran";
import Daftar from "../pages/Daftar";
import DaftarPencari from "../pages/DaftarPencari";
import DaftarPekerja from "../pages/DaftarPekerja";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<MasukPilihPeran />} />
      <Route path="/login/:mode" element={<Login />} />
      <Route path="/daftar" element={<Daftar />} />
      <Route path="/daftar/pencari" element={<DaftarPencari />} />
      <Route path="/daftar/pekerja" element={<DaftarPekerja />} />
      <Route path="*" element={<NotFound />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cari" element={<SearchResults />} />
        <Route path="/peta" element={<MapPage />} />
        <Route path="/pekerja/:id" element={<WorkerProfile />} />
        <Route path="/chat" element={<ChatInbox />} />
        <Route path="/chat/:id" element={<ChatRoom />} />
      </Route>

      {/* ── Area mitra (POV pekerja) — wajib login sbg worker/admin ── */}
      <Route
        path="/mitra"
        element={
          <ProtectedRoute loginPath="/login/pekerja">
            <WorkerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="jadwal" element={<Soon title="Jadwal" />} />
        <Route path="penghasilan" element={<Soon title="Penghasilan" />} />
        <Route path="ulasan" element={<Soon title="Ulasan" />} />
        <Route path="profil" element={<Soon title="Profil Saya" />} />
      </Route>

      {/* ── Area admin — login username/password terpisah ── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtected>
            <AdminLayout />
          </AdminProtected>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="verifikasi" element={<Soon title="Verifikasi Mitra" />} />
        <Route path="transaksi" element={<Soon title="Transaksi" />} />
        <Route path="sengketa" element={<Soon title="Sengketa" />} />
        <Route path="pengguna" element={<Soon title="Pengguna" />} />
        <Route path="pengaturan" element={<Soon title="Pengaturan" />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
