import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Shaded.png";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");
    if (!fullName || !email || !password || !confirmPassword)
      return setError("Please fill in all fields.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("Response data:", data);
      if (!res.ok) {
        setError(data.error || "Signup failed.");
        setLoading(false);
        return;
      }

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
      <div className="hidden sm:flex lg:w-full bg-[#2d5a27] px-6 py-3 justify-between items-center">
        <img src={logo} alt="Shaded logo" className="h-12" />
        <Link to="/login" className="text-white text-sm">
          Log In
        </Link>
      </div>

      {/* centered page content */}
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
          <h1 className="text-3xl font-bold text-[#1a3a1a]">Create Account</h1>
          <p className="text-sm text-[#588157] mt-1">
            Join Vancouver's shade movement.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          {/* full name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1a3a1a]">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#A3B18A] bg-white text-[#344E41] text-sm"
            />
          </div>

          {/* email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1a3a1a]">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#A3B18A] bg-white text-[#344E41] text-sm"
            />
          </div>

          {/* password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1a3a1a]">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#A3B18A] bg-white text-[#344E41] text-sm"
            />
          </div>

          {/* confirm password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1a3a1a]">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#A3B18A] bg-white text-[#344E41] text-sm"
            />
          </div>

          {/* error message */}
          {error && <p className="text-red-500 text-xs">{error}</p>}

          {/* create account button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 bg-[#2d5a27] text-white rounded-lg text-sm font-semibold mt-2 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <p className="text-sm text-[#588157] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#344E41] font-semibold">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;