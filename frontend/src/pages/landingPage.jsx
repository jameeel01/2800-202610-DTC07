import { Link } from "react-router-dom";
import mapImg from "../assets/map.png";

function Hero() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 sm:px-8 text-white overflow-hidden">

            // Vancouver map image
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

            // Green Gradiant
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(to bottom, #344e41 20%, #344e41 40%, transparent 100%)",
                }}
            />

            // Text
            <div className="relative z-10 w-full max-w-md space-y-6 sm:space-y-8 mt-12 sm:mt-16">
                <div className="space-y-2">
                    <h1 className="text-5xl sm:text-7xl font-black leading-tight drop-shadow-lg text-center">
                        Shade<br />
                        Vancouver<br />
                        Together.
                    </h1>
                    <p className="text-emerald-100 text-lg sm:text-2xl font-medium mt-4 sm:mt-6 drop-shadow-md text-center">
                        Nominate spots for new trees.<br />
                        Help your community stay cool.
                    </p>
                </div>

                {
                    // Buttons 
                }
                <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-8">
                    <Link
                        to="/Signup"
                        className="block w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-center text-base sm:text-lg transition-colors shadow-lg"
                    >
                        Create a Free Account
                    </Link>
                    <Link
                        to="/map"
                        className="block w-full bg-emerald-900 hover:bg-emerald-800 active:bg-emerald-950 text-white font-bold py-4 px-6 rounded-xl text-center text-base sm:text-lg transition-colors shadow-lg"
                    >
                        Explore the Map
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Hero;