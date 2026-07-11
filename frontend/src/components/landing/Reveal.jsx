import { motion, useReducedMotion } from "framer-motion";

// Pembungkus animasi scroll-reveal. Elemen muncul sekali saat masuk
// viewport; otomatis nonaktif jika pengguna memilih reduced motion.
const Reveal = ({ children, delay = 0, y = 28, className }) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
