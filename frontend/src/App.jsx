import "./App.css";
import LeafletMap from "./Map.jsx";

function App() {
  return (
    <>
      <button
        type="button"
        className="text-white bg-blue-600 box-border border border-transparent hover:bg-blue-700 shadow-xs font-medium leading-5 rounded-lg text-sm px-4 py-2.5 focus:outline-none"
      >
        Default
      </button>
      <LeafletMap />
    </>
  );
}

export default App;
