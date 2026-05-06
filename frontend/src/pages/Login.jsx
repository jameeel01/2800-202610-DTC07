import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Shaded.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7f0] flex flex-col">
      {/* top navbar */}
      <div className="w-full bg-[#2d5a27] px-6 py-3 flex justify-between items-center">
        <img src={logo} alt="Shaded logo" className="h-12" />
        <Link to="/signup" className="text-white text-sm">
          Sign Up
        </Link>
      </div>

      <div className="flex flex-col flex-1 px-6 py-6 max-w-sm w-full mx-auto">
        {/* back button */}
        <button
          onClick={() => window.history.back()}
          className="text-sm text-[#344E41] mb-6 text-left"
        >
          ← Back
        </button>

        {/* heading */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1a3a1a]">Welcome back</h1>
          <p className="text-sm text-[#588157] mt-1">
            Log in to your Shaded account.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          {/* email input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1a3a1a]">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#A3B18A] bg-white text-[#344E41] text-sm"
            />
          </div>

          {/* password input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1a3a1a]">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#A3B18A] bg-white text-[#344E41] text-sm"
            />
          </div>

          {/* error message */}
          {error && <p className="text-red-500 text-xs">{error}</p>}

          {/* submit button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-[#2d5a27] text-white rounded-lg text-sm font-semibold mt-2 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>

        <p className="text-sm text-[#588157] mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#344E41] font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;