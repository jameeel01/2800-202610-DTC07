import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Shaded.png";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-[#DAD7CD] flex items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* logo */}
        <img src={logo} alt="shaded logo" className="w-48" />

        <h1 className="text-3xl font-medium text-[#344E41]">
          Create Your Account
        </h1>

        <div className="w-full flex flex-col gap-4">
          {/* username input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#3A5A40]">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#A3B18A] bg-[#f5f3ee] text-[#344E41] text-sm"
            />
          </div>

          {/* email input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#3A5A40]">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#A3B18A] bg-[#f5f3ee] text-[#344E41] text-sm"
            />
          </div>

          {/* password input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#3A5A40]">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#A3B18A] bg-[#f5f3ee] text-[#344E41] text-sm"
            />
          </div>

          {/* create account button */}
          <button className="w-full py-3 bg-[#3A5A40] text-[#DAD7CD] rounded-lg text-sm font-medium">
            Create account
          </button>
        </div>

        <p className="text-sm text-[#588157]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#344E41] font-medium underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
