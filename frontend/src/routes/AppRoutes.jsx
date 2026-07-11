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
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cari" element={<SearchResults />} />
        <Route path="/peta" element={<MapPage />} />
        <Route path="/pekerja/:id" element={<WorkerProfile />} />
        <Route path="/chat" element={<ChatInbox />} />
        <Route path="/chat/:id" element={<ChatRoom />} />
        <Route path="/mitra" element={<PartnerHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
