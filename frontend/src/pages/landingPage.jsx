import { BrowserRouter } from "react-router-dom";
import shadedImg from "/src/assets/Shaded.png";


function LandingPage() {
    return (
        <div>
            <div className="min-h-screen bg-[#344E41] flex items-center">
                <div className="w-1/2 flex flex-col justify-center ml-32 gap-6">
                    <h1 className="text-8xl text-white font-bold leading-tight">
                        Shade<br />Vancouver<br />Together
                    </h1>
                    <h2 className="text-2xl text-[#a3b18a] font-semibold">Shaded</h2>
                    <p className="text-lg text-[#dad7cd] max-w-md">
                        Shaded is a community driven web application that empowers Vancouver residents to nominate, upvote, and track new tree planting locations in their neighborhood, helping the City prioritize where urban shade is needed the most.
                    </p>
                    <button className="bg-[#a3b18a] hover:bg-[#dad7cd] text-[#344e41] font-bold text-lg px-4 py-4 rounded-lg w-fit transition-colors duration-200">
                        Get Started
                    </button>
                </div>

                <div className="w-1/2 flex items-center justify-center mr-16">
                    <img src={shadedImg} alt="Shaded" className="w-250px" />
                </div>
            </div>

        </div>
    );
}

export default LandingPage;