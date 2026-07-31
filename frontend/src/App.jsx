import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import InstallPrompt from "./components/InstallPrompt";
import OfflineBanner from "./components/OfflineBanner";

function App() {
  return (
    <>
      <AppRoutes />
      {/* Popup pasang aplikasi (PWA) + pemberitahuan offline */}
      <InstallPrompt />
      <OfflineBanner />
      {/* Notifikasi toast bertema Torano (lihat .torano-toast di index.css) */}
      <Toaster
        position="top-center"
        gap={10}
        toastOptions={{ className: "torano-toast", duration: 3500 }}
      />
    </>
  );
}

export default App;
