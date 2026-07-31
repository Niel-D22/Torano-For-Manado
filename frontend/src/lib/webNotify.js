// Notifikasi web asli yang muncul di perangkat (butuh izin pengguna).
export const canNotify = () => typeof window !== "undefined" && "Notification" in window;

export const notifyPermission = () => (canNotify() ? Notification.permission : "denied");

export async function requestNotify() {
  if (!canNotify()) return "denied";
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function showNotify(title, body, onClick) {
  if (!canNotify() || Notification.permission !== "granted") return;
  try {
    const n = new Notification(title, { body, icon: "/favicon.svg", badge: "/favicon.svg" });
    if (onClick) {
      n.onclick = () => {
        window.focus();
        onClick();
        n.close();
      };
    }
  } catch {
    /* abaikan */
  }
}
