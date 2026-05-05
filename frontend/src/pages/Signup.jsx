import { useState } from "react";
import { Link } from "react-router-dom";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen bg-[#f0f7f0] flex flex-col">
      {/* top navbar */}
      <div className="w-full bg-[#2d5a27] px-6 py-3 flex justify-between items-center">
        <span className="text-white font-semibold text-lg">Shaded</span>
        <Link to="/login" className="text-white text-sm">
          Log In
        </Link>
      </div>

      {/* page content — centered narrow column like mobile wireframe */}
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

          {/* submit button */}
          <button className="w-full py-3 bg-[#2d5a27] text-white rounded-lg text-sm font-semibold mt-2">
            Create Account
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
