import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Shaded.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-[#DAD7CD] flex items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* logo */}
        <img src={logo} alt="shaded logo" className="w-48" />

        <h1 className="text-3xl font-medium text-[#344E41]">Login</h1>

        <div className="w-full flex flex-col gap-4">
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

          {/* submit button */}
          <button className="w-full py-3 bg-[#3A5A40] text-[#DAD7CD] rounded-lg text-sm font-medium">
            Submit
          </button>
        </div>

        <p className="text-sm text-[#588157]">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#344E41] font-medium underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
