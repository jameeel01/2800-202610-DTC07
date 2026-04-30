import { Link, useLocation } from "react-router-dom";
import { Home, Map, LogIn, UserPlus } from "lucide-react";

function Navbar() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/map", label: "Map", icon: Map },
    { to: "/login", label: "Login", icon: LogIn },
    { to: "/signup", label: "Sign Up", icon: UserPlus },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex justify-around items-center py-3 pb-6 z-50">
      {links.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-1 text-xs ${
              isActive ? "text-blue-400" : "text-gray-400"
            }`}
          >
            <Icon size={22} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default Navbar;
