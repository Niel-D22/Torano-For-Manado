import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import { api } from "./api";

// Auth berbasis Supabase: email/kata sandi & Google OAuth. `user` = profil dari
// backend (disinkron via /auth/sync), null bila belum login.
const AuthContext = createContext(null);

// Terjemahkan pesan error Supabase yang umum ke Bahasa Indonesia.
const humanize = (msg = "") => {
  if (/Invalid login credentials/i.test(msg)) return "Email atau kata sandi salah";
  if (/Email not confirmed/i.test(msg)) return "Email belum diverifikasi";
  if (/already registered|already exists|User already/i.test(msg)) return "Email sudah terdaftar";
  if (/signups are disabled/i.test(msg)) return "Pendaftaran email sedang dinonaktifkan";
  if (/is invalid/i.test(msg)) return "Alamat email tidak valid";
  if (/at least 8|password should be|weak/i.test(msg)) return "Kata sandi minimal 8 karakter";
  if (/rate limit/i.test(msg)) return "Terlalu banyak percobaan, coba lagi beberapa saat";
  return msg || "Terjadi kesalahan, coba lagi";
};

// Beranda default per peran.
export const homeForRole = (role) =>
  role === "admin" ? "/admin" : role === "worker" ? "/mitra" : "/";

const OAUTH_DEST_KEY = "torano_oauth_dest";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Buat/ambil profil di backend berdasarkan sesi aktif; kembalikan profilnya.
  const fetchProfile = useCallback(async (session) => {
    if (!session) {
      setUser(null);
      return null;
    }
    try {
      const { data } = await api.post("/auth/sync");
      const profile = data?.data?.profile ?? null;
      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => fetchProfile(data.session))
      .finally(() => setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      fetchProfile(session);
      // Setelah login Google kembali, arahkan ke tujuan sesuai peran yang dipilih.
      if (event === "SIGNED_IN") {
        const dest = sessionStorage.getItem(OAUTH_DEST_KEY);
        if (dest) {
          sessionStorage.removeItem(OAUTH_DEST_KEY);
          navigate(dest, { replace: true });
        }
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [fetchProfile, navigate]);

  const login = useCallback(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(humanize(error.message));
      return fetchProfile(data.session);
    },
    [fetchProfile],
  );

  const register = useCallback(
    async ({ email, password, fullName, role = "customer" }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });
      if (error) throw new Error(humanize(error.message));
      // Bila confirm email OFF, sesi langsung ada → sinkron profil & kembalikan.
      return data.session ? fetchProfile(data.session) : null;
    },
    [fetchProfile],
  );

  // Muat ulang profil dari backend (mis. setelah ganti foto profil).
  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return fetchProfile(data.session);
  }, [fetchProfile]);

  const loginWithGoogle = useCallback(async (dest = "/") => {
    // Simpan tujuan (mis. /mitra) agar tak hilang saat redirect ke Google.
    sessionStorage.setItem(OAUTH_DEST_KEY, dest);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      sessionStorage.removeItem(OAUTH_DEST_KEY);
      throw new Error(humanize(error.message));
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Gerbang aksi: jalankan action bila sudah login, jika belum arahkan ke /login
// sambil menyimpan tujuan agar bisa kembali setelah masuk.
export const useAuthGate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(
    (action) => {
      if (user) return action();
      const next = encodeURIComponent(location.pathname + location.search);
      // Aksi tergerbang (chat/booking/favorit) itu sisi pencari → langsung ke
      // form login pencari.
      navigate(`/login/pencari?next=${next}`);
    },
    [user, navigate, location],
  );
};
