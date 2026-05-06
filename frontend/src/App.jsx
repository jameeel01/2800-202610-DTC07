import "./App.css";
import LandingPage from "./pages/landingPage";
import LeafletMap from "./components/Map.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ImpactEstimatePage from "./pages/ImpactEstimatePage";
import { useState } from "react";
import ImpactEstimatePage from "./pages/ImpactEstimatePage";

function App() {
  const [isPinDropMode, setIsPinDropMode] = useState(false);
  return (
    <BrowserRouter>
      <Routes>
        {
          // Pages that do not need the navbar
        }
        <Route path="/" element={<LandingPage />} />

        {
          // Pages that do need the navbar
        }
        <Route
          element={
            <MainLayout
              isPinDropMode={isPinDropMode}
              setIsPinDropMode={setIsPinDropMode}
            />
          }
        >
          <Route
            path="/map"
            element={
              <LeafletMap
                isPinDropMode={isPinDropMode}
                setIsPinDropMode={setIsPinDropMode}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
                    <Route path="/nomination/:id/impact" element={<ImpactEstimatePage />} />
          <Route path="/nomination/:id/impact" element={<ImpactEstimatePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
