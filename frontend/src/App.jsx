// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "./assets/vite.svg";
// import heroImg from "./assets/hero.png";
import "./App.css";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/landingPage";
import { BrowserRouter } from "react-router-dom";
import LeafletMap from "./Map.jsx";

function App() {
    // const [count, setCount] = useState(0);

    return (
        <BrowserRouter>
            <Navbar />
            <LandingPage />
            <LeafletMap />
        </BrowserRouter>
    );
}

export default App;


