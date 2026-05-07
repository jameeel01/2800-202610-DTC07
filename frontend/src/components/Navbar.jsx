import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Map, LogIn, UserPlus, X } from "lucide-react";

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/map", label: "Map", icon: Map },
    { to: "/login", label: "Login", icon: LogIn },
    { to: "/signup", label: "Sign Up", icon: UserPlus },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Kevins navbar*/}
      <nav className="hidden sm:flex fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 justify-around items-center py-3 pb-6 z-50">
        {links.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 text-xs ${isActive ? "text-blue-400" : "text-gray-400"
                }`}
            >
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Ced mobile navbar/hamburger menu */}
      <nav className="sm:hidden fixed top-0 left-0 right-0 h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-5 z-50">
        <span className="text-blue-400 font-bold text-lg tracking-wide">MyApp</span>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-10 h-10 flex flex-col justify-center items-center gap-[5px] rounded-xl hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={22} className="text-blue-400" />
          ) : (
            <>
              <span className="block w-[22px] h-[2px] bg-gray-400 rounded" />
              <span className="block w-[22px] h-[2px] bg-gray-400 rounded" />
              <span className="block w-[22px] h-[2px] bg-gray-400 rounded" />
            </>
          )}
        </button>
      </nav>

      {/* Backdrop (mobile only) */}
      <div
        onClick={closeMenu}
        className={`sm:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Slide-in drawer (mobile only) */}
      <div
        className={`sm:hidden fixed top-0 right-0 bottom-0 w-56 bg-gray-800 border-l border-gray-700 z-50 pt-16 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {links.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={closeMenu}
              className={`flex items-center gap-4 px-6 py-4 text-sm font-medium border-l-[3px] transition-all duration-150 ${isActive
                ? "text-blue-400 border-blue-400 bg-blue-400/10"
                : "text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-700"
                }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="sm:hidden h-14" />
    </>
  );
}

export default Navbar;