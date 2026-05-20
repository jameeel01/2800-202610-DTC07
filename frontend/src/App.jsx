import "./App.css";
import LandingPage from "./pages/landingPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import AuthPage from "./pages/AuthPage";
import ImpactEstimatePage from "./pages/ImpactEstimatePage";
import Home from "./pages/Home";
import { useState } from "react";
import MapPage from "./pages/MapPage";
import NominationPage from "./pages/NominationPage";

function App() {
  const [isPinDropMode, setIsPinDropMode] = useState(false);
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages that do not need the navbar */}
        <Route path="/" element={<LandingPage />} />

        {/* Pages that do need the navbar */}
        <Route
          element={
            <MainLayout
              isPinDropMode={isPinDropMode}
              setIsPinDropMode={setIsPinDropMode}
            />
          }
        >
          <Route path="/home" element={<Home />} />
          <Route
            path="/map"
            element={
              <MapPage
                isPinDropMode={isPinDropMode}
                setIsPinDropMode={setIsPinDropMode}
              />
            }
          />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/nominations" element={<NominationPage />} />
          <Route
            path="/nomination/:id/impact"
            element={<ImpactEstimatePage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;