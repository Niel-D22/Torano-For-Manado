import { useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE } from "./landing/Reveal";

// Scroll ke atas tiap kali halaman baru dimuat.
const ScrollTop = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);
  return null;
};

// Membungkus Outlet layout agar perpindahan halaman terasa halus:
// halaman lama memudar keluar, halaman baru memudar + naik lembut.
export const AnimatedOutlet = () => {
  const location = useLocation();
  const element = useOutlet();
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <>
        <ScrollTop key={location.pathname} />
        {element}
      </>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        <ScrollTop />
        {element}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedOutlet;
