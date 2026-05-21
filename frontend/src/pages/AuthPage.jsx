import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Shaded.png";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5001";

const inputClass =
  "w-full px-4 py-3 border border-[#A3B18A] bg-white text-[#344E41] text-sm outline-none focus:border-[#344e41]";

function AuthPage() {
  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup fields
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const switchTab = (t) => {
    setTab(t);
    setError("");
  };

  const handleLogin = async () => {
    setError("");
    if (!loginEmail || !loginPassword)
      return setError("Please fill in all fields.");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    if (!fullName || !signupEmail || !signupPassword || !confirmPassword)
      return setError("Please fill in all fields.");
    if (signupPassword !== confirmPassword)
      return setError("Passwords do not match.");
    if (signupPassword.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: signupEmail,
          password: signupPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Signup failed.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7f0] flex flex-col">

      {/* header */}
      <div className="bg-[#4a7c59] px-6 py-4 flex items-center justify-between">
        <img src={logo} alt="Shaded" className="h-10" />
        <button
          onClick={() => navigate(-1)}
          className="text-white text-sm"
        >
          Back
        </button>
      </div>

      <div className="flex flex-col flex-1 px-6 py-8 max-w-sm w-full mx-auto">

        {/* tab switcher */}
        <div className="flex border border-[#A3B18A] mb-8" style={{ borderRadius: "2px" }}>
          <button
            onClick={() => switchTab("login")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === "login"
                ? "bg-[#344e41] text-white"
                : "bg-white text-[#344e41]"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => switchTab("signup")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === "signup"
                ? "bg-[#344e41] text-white"
                : "bg-white text-[#344e41]"
            }`}
          >
            Create Account
          </button>
        </div>

        {tab === "login" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1a3a1a]">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1a3a1a]">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-[#344e41] text-white text-sm font-semibold mt-2 disabled:opacity-60"
              style={{ borderRadius: "2px" }}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            <p className="text-sm text-[#588157] text-center">
              No account?{" "}
              <button
                onClick={() => switchTab("signup")}
                className="text-[#344E41] font-semibold underline"
              >
                Create one
              </button>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1a3a1a]">Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1a3a1a]">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1a3a1a]">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1a3a1a]">Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3 bg-[#344e41] text-white text-sm font-semibold mt-2 disabled:opacity-60"
              style={{ borderRadius: "2px" }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-sm text-[#588157] text-center">
              Already have an account?{" "}
              <button
                onClick={() => switchTab("login")}
                className="text-[#344E41] font-semibold underline"
              >
                Log in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
