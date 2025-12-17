import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr("");

    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/auth/register/", {
        username,
        email,
        password,
      });
      navigate("/login");
    } catch (error) {
      setErr(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Brand / Illustration */}
        <div className="hidden lg:flex relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-400/10 to-cyan-400/10" />
          <div className="p-10 flex flex-col justify-end w-full">
            <div className="mb-8">
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs text-blue-100">
                Join Us
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Create Your Account
            </h1>
            <p className="mt-2 text-blue-100/80 text-sm">
              Register to access the full control panel with masters, transactions, and reports.
            </p>

            {/* Decorative features strip */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { k: "Secure", v: "256-bit" },
                { k: "Access", v: "24/7" },
                { k: "Support", v: "Live" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white"
                >
                  <div className="text-xs text-blue-100/80">{s.k}</div>
                  <div className="text-lg font-semibold">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-blue-400/20 via-indigo-400/20 to-cyan-400/20 blur-2xl" />
          <div className="relative w-full rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-xl p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white">Register</h2>
                <p className="text-sm text-blue-100/80">Create a new account</p>
              </div>

              {err && (
                <div
                  className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-red-100"
                  role="alert"
                >
                  <svg className="h-5 w-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
                  </svg>
                  <span className="text-sm">{err}</span>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1">
                <label htmlFor="username" className="text-sm font-medium text-blue-100">
                  Username
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-blue-100/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    id="username"
                    type="text"
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-blue-100/60
                               focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-blue-100">
                  Email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-blue-100/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-blue-100/60
                               focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium text-blue-100">
                  Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-blue-100/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c.828 0 1.5.672 1.5 1.5S12.828 14 12 14s-1.5-.672-1.5-1.5S11.172 11 12 11Zm6-4V6a6 6 0 1 0-12 0v1H5a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1h-1Z" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-blue-100/60
                               focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-100/80 hover:text-white focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18M10.585 10.585A2 2 0 0 0 12 14a2 2 0 0 0 1.415-3.415M9.88 5.515A9.99 9.99 0 0 1 12 5c5.523 0 10 4.477 10 7-0 1.052-.485 2.053-1.339 2.97M6.16 6.16C4.09 7.263 2.61 8.96 2 12c0 2.523 4.477 7 10 7 1.228 0 2.403-.196 3.49-.557" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19S3.732 16.057 2.458 12Z" />
                        <circle cx="12" cy="12" r="3" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-blue-100">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-blue-100/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-blue-100/60
                               focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600
                           hover:from-emerald-500/90 hover:to-teal-600/90 active:scale-[0.99]
                           text-white py-3 rounded-lg font-medium shadow-lg shadow-emerald-900/30
                           focus:outline-none focus:ring-4 focus:ring-emerald-400/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  <>Create Account</>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-sm text-blue-100/70">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-blue-200 hover:text-white font-medium underline underline-offset-2"
                  >
                    Sign in
                  </button>
                </p>
              </div>

              <div className="pt-2 text-[11px] text-center text-blue-100/70">
                Protected environment. Unauthorized access prohibited.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
