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
import Login from "../pages/Login";
import Daftar from "../pages/Daftar";
import DaftarPencari from "../pages/DaftarPencari";
import DaftarPekerja from "../pages/DaftarPekerja";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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

      {/* ── Area mitra (POV pekerja) — layout & navigasi tersendiri ── */}
      <Route path="/mitra" element={<WorkerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="pesanan" element={<Soon title="Pesanan" />} />
        <Route path="jadwal" element={<Soon title="Jadwal" />} />
        <Route path="saldo" element={<Soon title="Saldo & Penarikan" />} />
        <Route path="profil" element={<Soon title="Profil & Keahlian" />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
