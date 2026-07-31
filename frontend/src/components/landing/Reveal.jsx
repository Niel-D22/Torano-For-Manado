import { motion, useReducedMotion } from "framer-motion";

// Easing lembut (ease-out yang nyaman di mata).
export const EASE = [0.22, 0.61, 0.36, 1];

const OFFSETS = {
  up: { y: 32 },
  down: { y: -28 },
  left: { x: 44 },
  right: { x: -44 },
  scale: { scale: 0.92 },
  none: {},
};

// Pembungkus scroll-reveal: elemen muncul sekali saat masuk viewport.
// `from` mengatur arah datangnya. Nonaktif saat pengguna pilih reduced motion.
const Reveal = ({ children, delay = 0, from = "up", duration = 0.7, once = true, className }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  const off = OFFSETS[from] ?? OFFSETS.up;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...off }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

// Container + item untuk cascade berurutan (dipakai hero saat halaman dibuka).
export const staggerContainer = (stagger = 0.09, delayChildren = 0.12) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

export const fadeUpItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const popItem = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

export default Reveal;
