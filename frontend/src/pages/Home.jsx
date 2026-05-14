import { Link } from "react-router-dom";
import mapImg from "../assets/Map.png";

function Home() {
    // get user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 sm:px-8 text-white overflow-hidden">
            {/* Vancouver map image */}
            <div className="pan-animation absolute inset-0 flex w-[200%] h-full">
                <img
                    src={mapImg}
                    alt=""
                    className="w-1/2 h-full object-cover brightness-20"
                />
                <img
                    src={mapImg}
                    alt=""
                    className="w-1/2 h-full object-cover brightness-20"
                />
            </div>

            {/* Green Gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(to bottom, #344e41 20%, #344e41 40%, transparent 100%)",
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md space-y-6 sm:space-y-8 mt-12 sm:mt-16">

                {/* Welcome message */}
                <div className="space-y-2 text-center">
                    <p className="text-emerald-300 text-base font-semibold uppercase tracking-widest">
                        Welcome back
                    </p>
                    <h1 className="text-5xl sm:text-6xl font-black leading-tight drop-shadow-lg">
                        Hey, {user?.name?.split(" ")[0] || "there"}
                    </h1>
                    <p className="text-emerald-100 text-lg sm:text-xl font-medium mt-4 drop-shadow-md">
                        Ready to help shade Vancouver?
                    </p>
                </div>

                {/* Stats bar */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex justify-around text-center">
                    <div>
                        <p className="text-2xl font-black text-emerald-300"></p>
                        <p className="text-xs text-emerald-100 font-semibold mt-1">Nominate</p>
                        <p className="text-xs text-emerald-200">a shady spot</p>
                    </div>
                    <div className="border-l border-white/20" />
                    <div>
                        <p className="text-2xl font-black text-emerald-300"></p>
                        <p className="text-xs text-emerald-100 font-semibold mt-1">Upvote</p>
                        <p className="text-xs text-emerald-200">community picks</p>
                    </div>
                    <div className="border-l border-white/20" />
                    <div>
                        <p className="text-2xl font-black text-emerald-300"></p>
                        <p className="text-xs text-emerald-100 font-semibold mt-1">Explore</p>
                        <p className="text-xs text-emerald-200">the map</p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3 sm:space-y-4 pt-2">
                    <Link
                        to="/map"
                        className="block w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-center text-base sm:text-lg transition-colors shadow-lg"
                    >
                        View the Map
                    </Link>
                    <Link
                        to="/map"
                        className="block w-full bg-emerald-900 hover:bg-emerald-800 active:bg-emerald-950 text-white font-bold py-4 px-6 rounded-xl text-center text-base sm:text-lg transition-colors shadow-lg"
                    >
                        View Nominations
                    </Link>
                    <button
                        onClick={() => {
                            // log out user
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            window.location.href = "/";
                        }}
                        className="block w-full bg-transparent border border-white/30 hover:bg-white/10 text-white/70 font-semibold py-3 px-6 rounded-xl text-center text-sm transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;