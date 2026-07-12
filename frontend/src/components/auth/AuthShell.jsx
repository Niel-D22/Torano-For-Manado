import bgAuth from "../../assets/BG_HeroLandingPage.png";

// Kerangka halaman auth: latar cat air Manado + kartu di tengah.
// align="start" untuk langkah wizard yang tinggi agar halaman scroll wajar.
const AuthShell = ({ children, align = "center" }) => (
  <div
    className={`relative flex min-h-screen justify-center overflow-hidden bg-paper px-4 py-3 sm:px-6 ${
      align === "start" ? "items-start" : "items-center"
    }`}
  >
    <img
      src={bgAuth}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom"
    />
    {children}
  </div>
);

export default AuthShell;
