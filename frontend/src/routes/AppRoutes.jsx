import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import SearchResults from "../pages/SearchResults";
import MapPage from "../pages/MapPage";
import WorkerProfile from "../pages/WorkerProfile";
import ChatInbox from "../pages/ChatInbox";
import ChatRoom from "../pages/ChatRoom";
import PartnerHome from "../pages/PartnerHome";
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
        <Route path="/mitra" element={<PartnerHome />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
