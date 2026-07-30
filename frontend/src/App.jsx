import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <AppRoutes />
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
