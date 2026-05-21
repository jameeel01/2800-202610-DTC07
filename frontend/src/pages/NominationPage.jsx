import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    calculateTreeCount,
    calculateTempReduction,
    calculateShadeArea,
} from "../utils/shadeCalc";
import logo from "../assets/Shaded.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const FILTERS = ["All", "Recent", "Most Upvoted", "Mine"];

function NominationCard({ nomination }) {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const isOwn = user && String(nomination.nominatorId) === String(user.id);
    const trees = calculateTreeCount(nomination.upvoteCount);
    const temp = calculateTempReduction(trees);
    const shade = calculateShadeArea(trees);
    const [isExpanded, setIsExpanded] = useState(false);
    const [upvoteCount, setUpvoteCount] = useState(nomination.upvoteCount);
    const [hasUpvoted, setHasUpvoted] = useState(
        Array.isArray(nomination.upvoterIds) && user
            ? nomination.upvoterIds.some((id) => String(id) === String(user.id))
            : false
    );

    const handleUpvote = async (e) => {
        e.stopPropagation();
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            const res = await fetch(
                `${API_URL}/api/nominations/${nomination._id}/upvote`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            if (res.ok) {
                setUpvoteCount(data.upvoteCount ?? upvoteCount + (hasUpvoted ? -1 : 1));
                setHasUpvoted((prev) => !prev);
            }
        } catch (err) {
            console.error("Upvote error:", err);
        }
    };

    const handleViewOnMap = (e) => {
        e.stopPropagation();
        navigate("/map", { state: { selectedNominationId: nomination._id } });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* card header — always visible, click to expand */}
            <div
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-3">
                        {/* badges */}
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold bg-[#2d5a27] text-white px-2 py-0.5 rounded-full">
                                {nomination.status || "pending"}
                            </span>
                            {isOwn && (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                    Yours
                                </span>
                            )}
                        </div>
                        <h3 className="text-[15px] font-bold text-gray-900 truncate">
                            {nomination.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            by {isOwn ? "you" : nomination.nominatorName}
                        </p>
                    </div>

                    {/* upvote count + chevron */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="flex flex-col items-center bg-[#f0f7f0] rounded-xl px-3 py-2 border border-gray-200">
                            <span className="text-[#2d5a27] text-sm">▲</span>
                            <span className="text-[13px] font-bold text-[#2d5a27]">
                                {upvoteCount}
                            </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                            {isExpanded ? "▲" : "▼"}
                        </span>
                    </div>
                </div>

                {/* impact summary */}
                <div className="flex gap-3 mt-2 text-[11px] text-[#2d5a27] font-semibold">
                    <span>{trees} trees</span>
                    <span>-{temp}°C</span>
                    <span>{shade}m²</span>
                </div>
            </div>

            {/* expanded dropdown */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-4">
                    <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
                        {nomination.description || "No description provided."}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleUpvote}
                            style={{ borderRadius: "2px" }}
                            className={`flex-1 py-2.5 text-[13px] font-bold transition-colors border ${hasUpvoted
                                ? "bg-[#344e41] text-white border-[#344e41]"
                                : "bg-white text-[#344e41] border-[#344e41]"
                                }`}
                        >
                            {!token ? "Log in to upvote" : hasUpvoted ? `${upvoteCount} Upvoted` : `${upvoteCount} Upvote`}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/nomination/${nomination._id}`); }}
                            style={{ borderRadius: "2px" }}
                            className="flex-1 py-2.5 bg-[#344e41] text-white text-[13px] font-bold"
                        >
                            View Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function NominationPage() {
    const [nominations, setNominations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("All");

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetch(`${API_URL}/api/nominations`)
            .then((res) => res.json())
            .then((data) => {
                setNominations(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load nominations.");
                setLoading(false);
            });
    }, []);

    const filtered = nominations
        .filter((n) => {
            if (activeFilter === "Mine")
                return user && n.nominatorEmail === user.email;
            return true;
        })
        .sort((a, b) => {
            if (activeFilter === "Most Upvoted") return b.upvoteCount - a.upvoteCount;
            if (activeFilter === "Recent")
                return new Date(b.createdAt) - new Date(a.createdAt);
            return 0;
        });

    return (
        <div className="min-h-screen bg-[#f0f7f0]">
            {/* header with shaded logo — desktop only */}
            <div className="hidden sm:flex w-full bg-[#2d5a27] px-6 py-3 justify-between items-center">
                <img src={logo} alt="Shaded logo" className="h-12" />
            </div>

            {/* extra bottom padding so navbar doesnt cut off last card */}
            <div className="px-4 py-6 pb-24 max-w-2xl mx-auto">
                {/* header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Nominations</h1>
                    <p className="text-sm text-[#2d5a27] mt-1">
                        Community spots nominated for shade trees in Vancouver.
                    </p>
                </div>

                {/* filter tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap border transition-colors ${activeFilter === f
                                ? "bg-[#2d5a27] text-white border-[#2d5a27]"
                                : "bg-white text-[#2d5a27] border-[#2d5a27]"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* list */}
                {loading && (
                    <p className="text-gray-500 text-sm">Loading nominations...</p>
                )}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {!loading && !error && filtered.length === 0 && (
                    <p className="text-gray-500 text-sm">No nominations found.</p>
                )}
                <div className="flex flex-col gap-3">
                    {filtered.map((n) => (
                        <NominationCard key={n._id} nomination={n} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NominationPage;