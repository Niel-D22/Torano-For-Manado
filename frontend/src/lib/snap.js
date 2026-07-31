// Memuat skrip Midtrans Snap sekali, lalu mengembalikan window.snap.
let loading = null;

export function loadSnap(clientKey, isProduction) {
  if (typeof window !== "undefined" && window.snap) return Promise.resolve(window.snap);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    s.setAttribute("data-client-key", clientKey || "");
    s.onload = () => resolve(window.snap);
    s.onerror = () => {
      loading = null;
      reject(new Error("Gagal memuat pembayaran"));
    };
    document.body.appendChild(s);
  });
  return loading;
}
