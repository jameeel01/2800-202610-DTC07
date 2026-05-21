import { Link, useNavigate } from "react-router-dom";
import mapImg from "../assets/Map.jpg";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 sm:px-8 text-white overflow-hidden">

      {/* Vancouver map background */}
      <div className="pan-animation absolute inset-0 flex w-[200%] h-full">
        <img src={mapImg} alt="" className="w-1/2 h-full object-cover brightness-20" />
        <img src={mapImg} alt="" className="w-1/2 h-full object-cover brightness-20" />
      </div>

      {/* Dark green overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #344e41 20%, #344e41 40%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-6 sm:space-y-8 mt-12 sm:mt-16">

        {/* Welcome */}
        <div className="space-y-2 text-center">
          <p className="text-white/60 text-sm font-semibold uppercase tracking-widest">
            Welcome back
          </p>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight">
            Hey, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-white/70 text-lg sm:text-xl font-medium mt-4">
            Ready to help shade Vancouver?
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          <Link
            to="/map"
            className="block w-full bg-[#344e41] hover:bg-[#2d4438] text-white font-bold py-4 px-6 text-center text-base transition-colors border border-white/20"
            style={{ borderRadius: "2px" }}
          >
            View the Map
          </Link>
          <Link
            to="/nominations"
            className="block w-full bg-[#344e41] hover:bg-[#2d4438] text-white font-bold py-4 px-6 text-center text-base transition-colors border border-white/20"
            style={{ borderRadius: "2px" }}
          >
            View Nominations
          </Link>
          <Link
            to="/profile"
            className="block w-full bg-[#344e41] hover:bg-[#2d4438] text-white font-bold py-4 px-6 text-center text-base transition-colors border border-white/20"
            style={{ borderRadius: "2px" }}
          >
            My Profile
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full bg-transparent hover:bg-white/10 text-white/70 font-semibold py-3 px-6 text-center text-sm transition-colors border border-white/20 w-full"
            style={{ borderRadius: "2px" }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;