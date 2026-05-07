import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import StarRating from "../components/StarRating";
import {
  calculateTreeCount,
  calculateShadeArea,
  calculateTempReduction,
  calculateCO2,
  calculateCommunityStars,
} from "../utils/shadeCalc";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

function ImpactEstimatePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [impact, setImpact] = useState({
    trees: 0,
    temp: 0,
    shade: 0,
    co2: 0,
    stars: 0,
  });

  useEffect(() => {
    async function fetchNominationAndCalculateImpact() {
      try {
        setLoading(true);
        // Fetch nomination data
        const response = await fetch(`${BACKEND_URL}/api/nominations/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch nomination: ${response.status}`);
        }
        const nominationData = await response.json();
        setNomination(nominationData);

        // Calculate impact based on upvote count
        const trees = calculateTreeCount(nominationData.upvoteCount);
        const temp = calculateTempReduction(trees);
        const shade = calculateShadeArea(trees);
        const co2 = calculateCO2(trees);
        const stars = calculateCommunityStars(nominationData.upvoteCount);

        setImpact({ trees, temp, shade, co2, stars });
      } catch (err) {
        console.error("Failed to load nomination:", err);
        setError("Failed to load nomination. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchNominationAndCalculateImpact();
    }
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f7f0] px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading || !nomination) {
    return (
      <div className="min-h-screen bg-[#f0f7f0] px-4 py-6 flex items-center justify-center">
        <div className="text-gray-500">Loading nomination...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f7f0] px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 mb-6"
      >
        Back
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-900">Impact Estimate</h1>
      <p className="text-sm text-[#2d5a27] mt-1 mb-8">
        {nomination.title} with {impact.trees}{" "}
        {impact.trees === 1 ? "tree" : "trees"}
      </p>

      {/* Stat cards */}
      <div className="flex flex-col gap-4">
        <StatCard
          value={`${impact.temp}°C`}
          label="Temperature Reduction"
          subtext="Within 50m radius"
        />
        <StatCard
          value={`${impact.shade} m²`}
          label="Shade Coverage"
          subtext="During peak sun"
        />
        <StatCard
          value={`${impact.co2} kg/yr`}
          label="CO2 Absorption"
          subtext="Annual carbon absorbed"
        />
        <StatCard label="Community Impact" subtext="Upvotes & proximity">
          <StarRating stars={impact.stars} />
        </StatCard>
      </div>

      {/* Source */}
      <p className="text-xs text-gray-400 mt-8 text-center">
        Source: City of Vancouver Urban Forestry Strategy
      </p>
    </div>
  );
}

export default ImpactEstimatePage;
