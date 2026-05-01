import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "./assets/vite.svg";
// import heroImg from "./assets/hero.png";
import "./App.css";
import Navbar from "./components/Navbar";
import { BrowserRouter } from "react-router-dom";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
=======
import "./App.css";
import LeafletMap from "./Map.jsx";

function App() {
  return (
    <>
      <LeafletMap />
    </>
>>>>>>> leaflet
  );
}

export default App;
