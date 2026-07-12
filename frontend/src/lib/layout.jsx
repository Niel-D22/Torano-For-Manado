import { createContext, useContext, useState } from "react";

// Lebar navbar mengikuti konteks: mode biasa = max-w-7xl (sejajar konten),
// mode peta/split = full-width agar mentok kiri-kanan tanpa celah pinggir.
const LayoutContext = createContext({ wide: false, setWide: () => {} });

export const LayoutProvider = ({ children }) => {
  const [wide, setWide] = useState(false);
  return (
    <LayoutContext.Provider value={{ wide, setWide }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
