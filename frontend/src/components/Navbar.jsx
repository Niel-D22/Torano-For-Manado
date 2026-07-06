import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          Bakudapa
        </Link>
        <div className="flex gap-4 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-amber-600">
            Home
          </Link>
          <Link to="/login" className="hover:text-amber-600">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
