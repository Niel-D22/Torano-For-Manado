import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AnimatedOutlet } from "../components/PageTransition";
import { LayoutProvider } from "../lib/layout";

const MainLayout = () => {
  return (
    <LayoutProvider>
      <div className="flex min-h-screen flex-col bg-paper">
        <Navbar />
        <main className="flex-1">
          <AnimatedOutlet />
        </main>
        <Footer />
      </div>
    </LayoutProvider>
  );
};

export default MainLayout;
