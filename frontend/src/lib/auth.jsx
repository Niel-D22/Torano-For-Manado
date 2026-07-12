import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Auth ringan untuk demo: cukup tandai "sudah login" + nama, disimpan di
// localStorage. Belum tersambung backend — diganti Supabase Auth di Fase 0.
const AuthContext = createContext(null);
const KEY = "torano_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch {
      return null;
    }
  });

  const login = useCallback((data = { name: "Nanda" }) => {
    setUser(data);
    localStorage.setItem(KEY, JSON.stringify(data));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Gerbang aksi: jalankan action bila sudah login, jika belum arahkan ke
// /login sambil menyimpan tujuan agar bisa kembali setelah masuk.
export const useAuthGate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(
    (action) => {
      if (user) return action();
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`);
    },
    [user, navigate, location],
  );
};
