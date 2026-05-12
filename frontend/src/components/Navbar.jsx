import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, LogIn, UserPlus, LogOut } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // show different nav if logged in
  const links = user
    ? [
        { to: "/", label: "Home", icon: Home },
        { to: "/map", label: "Map", icon: Map },
      ]
    : [
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
      {/* show username and logout WHEN logged in */}
      {user && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-gray-300">{user.username}</span>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut size={22} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
