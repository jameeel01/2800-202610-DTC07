import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Shaded.png";
import {
    calculateTreeCount,
    calculateTempReduction,
    calculateShadeArea,
} from "../utils/shadeCalc";

const API_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:5001";

const inputClass =
    "w-full px-4 py-3 rounded-lg border border-[#A3B18A] bg-white text-[#344E41] text-sm";
const labelClass = "text-sm font-medium text-[#1a3a1a]";

function NominationCard({ nomination, type }) {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const trees = calculateTreeCount(nomination.upvoteCount);
    const temp = calculateTempReduction(trees);
    const shade = calculateShadeArea(trees);

    return (
        <div className="bg-white rounded-2xl border border-[#A3B18A] overflow-hidden">
            {/* card header */}
            <div
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold bg-[#2d5a27] text-white px-2 py-0.5 rounded-full">
                                {nomination.status || "pending"}
                            </span>
                            {type === "upvoted" && (
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    Upvoted
                                </span>
                            )}
                        </div>
                        <h3 className="text-[14px] font-bold text-[#1a3a1a] truncate">
                            {nomination.title}
                        </h3>
                        <p className="text-[11px] text-[#588157] mt-0.5">
                            by {nomination.nominatorName}
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className="text-[13px] font-bold text-[#344e41]">
                            ▲ {nomination.upvoteCount}
                        </span>
                        <span className="text-gray-400 text-xs">
                            {isExpanded ? "▲" : "▼"}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3 mt-2 text-[11px] text-[#588157] font-semibold">
                    <span>{trees} trees</span>
                    <span>-{temp}°C</span>
                    <span>{shade}m² shade</span>
                </div>
            </div>

            {/* expanded content */}
            {isExpanded && (
                <div className="border-t border-[#A3B18A] p-4">
                    <p className="text-[13px] text-[#344E41] mb-4 leading-relaxed">
                        {nomination.description || "No description provided."}
                    </p>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/nomination/${nomination._id}`); }}
                        className="w-full py-2.5 bg-[#344e41] text-white text-[13px] font-bold"
                        style={{ borderRadius: "2px" }}
                    >
                        View Details
                    </button>
                </div>
            )}
        </div>
    );
}

function Profile() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const [myNominations, setMyNominations] = useState([]);
    const [upvotedNominations, setUpvotedNominations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("nominations");

    // edit name state
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.name || "");
    const [nameError, setNameError] = useState("");
    const [nameSaving, setNameSaving] = useState(false);

    // change password state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordSaving, setPasswordSaving] = useState(false);

    // redirect if not logged in
    useEffect(() => {
        if (!user || !token) {
            navigate("/login");
        }
    }, []);

    // fetch user's nominations and upvoted nominations
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/nominations`);
                const all = await res.json();

                // filter nominations by this user
                setMyNominations(
                    all.filter((n) => String(n.nominatorId) === String(user.id))
                );

                // filter nominations this user has upvoted
                setUpvotedNominations(
                    all.filter((n) => n.upvoterIds?.includes(user.id))
                );
            } catch (err) {
                console.error("Failed to fetch nominations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSaveName = async () => {
        setNameError("");
        if (!newName.trim()) return setNameError("Name cannot be empty.");

        setNameSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/update-name`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newName.trim() }),
            });

            const data = await res.json();
            if (!res.ok) return setNameError(data.error || "Failed to update name.");

            // update localStorage with new name
            const updatedUser = { ...user, name: newName.trim() };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setIsEditingName(false);
        } catch {
            setNameError("Something went wrong.");
        } finally {
            setNameSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");
        if (!currentPassword || !newPassword || !confirmNewPassword)
            return setPasswordError("Please fill in all fields.");
        if (newPassword !== confirmNewPassword)
            return setPasswordError("New passwords do not match.");
        if (newPassword.length < 6)
            return setPasswordError("Password must be at least 6 characters.");

        setPasswordSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/change-password`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();
            if (!res.ok)
                return setPasswordError(data.error || "Failed to change password.");

            setPasswordSuccess("Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setShowPasswordForm(false);
        } catch {
            setPasswordError("Something went wrong.");
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // initials for avatar
    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // stats
    const totalUpvotesReceived = myNominations.reduce(
        (sum, n) => sum + n.upvoteCount,
        0
    );

    return (
        <div className="min-h-screen bg-[#f0f7f0] flex flex-col">
            {/* top navbar — desktop only */}
            <div className="hidden sm:flex w-full bg-[#2d5a27] px-6 py-3 justify-between items-center">
                <img src={logo} alt="Shaded logo" className="h-12" />
            </div>

            <div className="flex flex-col flex-1 px-6 py-6 pb-24 w-full max-w-4xl mx-auto">

                {/* back button */}
                <button
                    onClick={() => window.history.back()}
                    className="text-sm text-[#344E41] mb-6 text-left"
                >
                    Back
                </button>

                {/* desktop: two column layout */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* left column — profile info */}
                    <div className="flex flex-col gap-4 lg:w-80 shrink-0">

                        {/* avatar + name */}
                        <div className="bg-white rounded-2xl border border-[#A3B18A] p-6 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-[#2d5a27] flex items-center justify-center text-white text-3xl font-black mb-4">
                                {initials}
                            </div>
                            <h1 className="text-xl font-bold text-[#1a3a1a]">{user?.name}</h1>
                            <p className="text-sm text-[#588157] mt-1">{user?.email}</p>
                        </div>

                        {/* stats */}
                        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                            {[
                                { label: "Nominations", value: myNominations.length },
                                { label: "Upvotes Given", value: upvotedNominations.length },
                                { label: "Upvotes Received", value: totalUpvotesReceived },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="bg-white rounded-2xl border border-[#A3B18A] p-3 text-center lg:flex lg:items-center lg:justify-between lg:text-left lg:px-5"
                                >
                                    <p className="text-sm text-[#588157] lg:order-1">{label}</p>
                                    <p className="text-xl font-black text-[#2d5a27] lg:order-2">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* edit name */}
                        <div className="bg-white rounded-2xl border border-[#A3B18A] p-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-bold text-[#1a3a1a]">Display Name</p>
                                <button
                                    onClick={() => setIsEditingName((prev) => !prev)}
                                    className="text-xs text-[#2d5a27] font-semibold underline"
                                >
                                    {isEditingName ? "Cancel" : "Edit"}
                                </button>
                            </div>
                            {isEditingName ? (
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className={inputClass}
                                        placeholder="Enter new name"
                                    />
                                    {nameError && (
                                        <p className="text-red-500 text-xs">{nameError}</p>
                                    )}
                                    <button
                                        onClick={handleSaveName}
                                        disabled={nameSaving}
                                        className="w-full py-2.5 bg-[#2d5a27] text-white rounded-lg text-sm font-semibold disabled:opacity-60"
                                    >
                                        {nameSaving ? "Saving..." : "Save Name"}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-[#344E41]">{user?.name}</p>
                            )}
                        </div>

                        {/* change password */}
                        <div className="bg-white rounded-2xl border border-[#A3B18A] p-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-bold text-[#1a3a1a]">Password</p>
                                <button
                                    onClick={() => setShowPasswordForm((prev) => !prev)}
                                    className="text-xs text-[#2d5a27] font-semibold underline"
                                >
                                    {showPasswordForm ? "Cancel" : "Change"}
                                </button>
                            </div>
                            {showPasswordForm ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className={labelClass}>Current Password</label>
                                        <input
                                            type="password"
                                            placeholder="Enter current password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className={labelClass}>New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className={labelClass}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Repeat new password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    {passwordError && (
                                        <p className="text-red-500 text-xs">{passwordError}</p>
                                    )}
                                    {passwordSuccess && (
                                        <p className="text-green-600 text-xs">{passwordSuccess}</p>
                                    )}
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={passwordSaving}
                                        className="w-full py-2.5 bg-[#2d5a27] text-white rounded-lg text-sm font-semibold disabled:opacity-60"
                                    >
                                        {passwordSaving ? "Saving..." : "Change Password"}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-[#344E41]">••••••••</p>
                            )}
                        </div>

                        {/* logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 bg-white border-2 border-red-300 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                        >
                            Log Out
                        </button>
                    </div>

                    {/* right column — nominations */}
                    <div className="flex-1 min-w-0">
                        {/* tabs */}
                        <div className="flex gap-2 mb-4">
                            {["nominations", "upvoted"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-full text-[12px] font-bold border transition-colors ${activeTab === tab
                                        ? "bg-[#2d5a27] text-white border-[#2d5a27]"
                                        : "bg-white text-[#2d5a27] border-[#2d5a27]"
                                        }`}
                                >
                                    {tab === "nominations" ? "My Nominations" : "Upvoted"}
                                </button>
                            ))}
                        </div>

                        {/* tab content */}
                        {loading ? (
                            <p className="text-sm text-[#588157]">Loading...</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {activeTab === "nominations" && (
                                    <>
                                        {myNominations.length === 0 ? (
                                            <p className="text-sm text-[#588157]">
                                                You have not nominated any spots yet.
                                            </p>
                                        ) : (
                                            myNominations.map((n) => (
                                                <NominationCard
                                                    key={n._id}
                                                    nomination={n}
                                                    type="mine"
                                                />
                                            ))
                                        )}
                                    </>
                                )}
                                {activeTab === "upvoted" && (
                                    <>
                                        {upvotedNominations.length === 0 ? (
                                            <p className="text-sm text-[#588157]">
                                                You have not upvoted any spots yet.
                                            </p>
                                        ) : (
                                            upvotedNominations.map((n) => (
                                                <NominationCard
                                                    key={n._id}
                                                    nomination={n}
                                                    type="upvoted"
                                                />
                                            ))
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;