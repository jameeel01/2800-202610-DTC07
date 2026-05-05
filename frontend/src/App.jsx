import "./App.css";
import LandingPage from "./pages/landingPage";
import LeafletMap from "./Map.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";

function App() {
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
                <Route element={<MainLayout />}>
                    <Route path="/map" element={<LeafletMap />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;