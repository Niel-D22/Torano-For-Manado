import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import SearchResults from "../pages/SearchResults";
import MapPage from "../pages/MapPage";
import WorkerProfile from "../pages/WorkerProfile";
import ProfilPencari from "../pages/ProfilPencari";
import CaraKerja from "../pages/CaraKerja";
import Keamanan from "../pages/Keamanan";
import TentangKami from "../pages/TentangKami";
import Bantuan from "../pages/Bantuan";
import ChatInbox from "../pages/ChatInbox";
import WorkerLayout from "../layouts/WorkerLayout";
import Dashboard from "../pages/worker/Dashboard";
import ProfilSaya from "../pages/worker/ProfilSaya";
import Jadwal from "../pages/worker/Jadwal";
import Ulasan from "../pages/worker/Ulasan";
import Penghasilan from "../pages/worker/Penghasilan";
import Soon from "../pages/worker/Soon";
import AdminLayout from "../layouts/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import AdminVerifikasi from "../pages/admin/AdminVerifikasi";
import AdminPengguna from "../pages/admin/AdminPengguna";
import AdminSengketa from "../pages/admin/AdminSengketa";
import AdminTransaksi from "../pages/admin/AdminTransaksi";
import AdminLaporan from "../pages/admin/AdminLaporan";
import AdminPengaturan from "../pages/admin/AdminPengaturan";
import AdminLogin from "../pages/admin/AdminLogin";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminProtected from "../components/AdminProtected";
import Login from "../pages/Login";
import LupaSandi from "../pages/LupaSandi";
import ResetSandi from "../pages/ResetSandi";
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
      <Route path="/lupa-sandi" element={<LupaSandi />} />
      <Route path="/reset-sandi" element={<ResetSandi />} />
      <Route path="/daftar" element={<Daftar />} />
      <Route path="/daftar/pencari" element={<DaftarPencari />} />
      <Route path="/daftar/pekerja" element={<DaftarPekerja />} />
      <Route path="*" element={<NotFound />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cari" element={<SearchResults />} />
        <Route path="/peta" element={<MapPage />} />
        <Route path="/cara-kerja" element={<CaraKerja />} />
        <Route path="/keamanan" element={<Keamanan />} />
        <Route path="/tentang" element={<TentangKami />} />
        <Route path="/pekerja/:id" element={<WorkerProfile />} />
        <Route
          path="/akun"
          element={
            <ProtectedRoute>
              <ProfilPencari />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bantuan"
          element={
            <ProtectedRoute>
              <Bantuan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <ChatInbox />
            </ProtectedRoute>
          }
        />
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
        <Route path="jadwal" element={<Jadwal />} />
        <Route path="pesan" element={<ChatInbox />} />
        <Route path="penghasilan" element={<Penghasilan />} />
        <Route path="ulasan" element={<Ulasan />} />
        <Route path="profil" element={<ProfilSaya />} />
        <Route path="bantuan" element={<Bantuan />} />
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
        <Route path="verifikasi" element={<AdminVerifikasi />} />
        <Route path="transaksi" element={<AdminTransaksi />} />
        <Route path="sengketa" element={<AdminSengketa />} />
        <Route path="laporan" element={<AdminLaporan />} />
        <Route path="pengguna" element={<AdminPengguna />} />
        <Route path="pengaturan" element={<AdminPengaturan />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
