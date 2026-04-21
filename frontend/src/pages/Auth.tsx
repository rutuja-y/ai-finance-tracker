// This file contains BOTH Login and Signup pages (React + Tailwind)
// You can split later if needed
import { Link } from "react-router-dom";
import { useState } from "react";

const Input = ({ type, placeholder, value, onChange }: any) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value || ""}
    onChange={onChange || (() => {})}
    className="w-full p-4 rounded-xl bg-[#020617] border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white"
  />
);


function LeftPanel({ isSignup }: { isSignup: boolean }) {
  return (
    <div className="hidden md:flex w-1/2 h-screen bg-gradient-to-br from-[#022c22] to-[#064e3b] items-center justify-center">
      <div className="text-center max-w-md space-y-6">
        <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto text-black font-bold">↗</div>
        <h1 className="text-4xl font-bold text-emerald-400">FinanceAI</h1>
        <p className="text-gray-300">
          Your intelligent financial copilot. Track, analyze, predict, and optimize your spending with AI-powered insights.
        </p>

        {!isSignup ? (
          <div className="flex gap-3 justify-center">
            {["AI", "24/7", "ML"].map((item, i) => (
              <div key={i} className="px-4 py-2 rounded-xl border border-gray-700 bg-white/5 backdrop-blur">
                <p className="text-emerald-400 font-semibold">{item}</p>
                <p className="text-xs text-gray-400">
                  {item === "AI" && "Smart Tracking"}
                  {item === "24/7" && "Insights"}
                  {item === "ML" && "Predictions"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[
              "Automatic expense categorization with AI",
              "Real-time spending insights & predictions",
              "Personalized financial health scoring",
            ].map((text, i) => (
              <div key={i} className="px-4 py-2 rounded-full bg-white/5 border border-gray-700 text-sm text-gray-300">
                • {text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="flex h-screen bg-[#020617] text-white">
      <LeftPanel isSignup={false} />

      <div className="flex w-full md:w-1/2 items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="text-gray-400">Sign in to continue to your dashboard</p>
          </div>

          <Input type="email" placeholder="Email" value={email} onChange={(e:any)=>setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e:any)=>setPassword(e.target.value)} />

          <div className="text-right text-sm text-emerald-400 cursor-pointer">
            Forgot password?
          </div>

          <button
            className="w-full h-12 bg-emerald-500 rounded-xl font-semibold"
            onClick={async () => {
                const res = await fetch("http://127.0.0.1:8000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
                });

                const data = await res.json();
                console.log("LOGIN RESPONSE:", data);

                if (res.ok) {
                localStorage.setItem("token", data.access_token);
                window.location.href = "/";
                } else {
                alert(data.detail);
                }
            }}
            >
            Sign In
          </button>

          <p className="text-center text-gray-400">
            Don’t have an account? <Link to="/signup" className="text-emerald-400">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  return (
    <div className="flex h-screen bg-[#020617] text-white">
      <LeftPanel isSignup={true} />

      <div className="flex w-full md:w-1/2 items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Create your account</h2>
            <p className="text-gray-400">Start your journey to smarter finances</p>
          </div>

          <Input type="text" placeholder="Full Name" value={name} onChange={(e:any)=>setName(e.target.value)} />
          <Input type="email" placeholder="Email" value={email} onChange={(e:any)=>setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e:any)=>setPassword(e.target.value)} />

          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e: any) => setConfirmPassword(e.target.value)}
          />

          <p className="text-sm text-gray-500">Must be at least 8 characters</p>

          <button className="w-full h-12 border border-gray-700 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800">
            <span>🔵</span> Continue with Google
          </button>
          <button
            className="w-full h-12 bg-emerald-500 rounded-xl font-semibold"
            onClick={async () => {

                if (password !== confirmPassword) {
                  alert("Passwords do not match");
                  return;
                }
                const res = await fetch("http://127.0.0.1:8000/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
                });

                const data = await res.json();

                if (res.ok) {
                alert("Signup successful!");
                window.location.href = "/login";
                } else {
                alert(data.detail);
                }
            }}
            >
            Create Account
          </button>


          <p className="text-center text-gray-400">
            Already have an account? <Link to="/login" className="text-emerald-400">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
