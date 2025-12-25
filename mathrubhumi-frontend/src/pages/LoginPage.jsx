import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import { setSession } from "../utils/session";

export default function LoginPage() {
  const navigate = useNavigate();
  const branchBoxRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesErr, setBranchesErr] = useState("");
  const [branchQuery, setBranchQuery] = useState("");
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setBranchesLoading(true);
      setBranchesErr("");
      try {
        const res = await api.get("auth/branches/");
        const list = Array.isArray(res.data) ? res.data : [];
        if (!alive) return;
        setBranches(list);
        if (list.length === 1) {
          setBranchId(String(list[0].id));
          setBranchQuery(list[0].branches_nm || "");
        }
      } catch (_) {
        if (!alive) return;
        setBranchesErr("Unable to load branches. Please try again.");
      } finally {
        if (!alive) return;
        setBranchesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const selectedBranch = useMemo(() => {
    const id = Number(branchId);
    if (!id) return null;
    return branches.find((b) => Number(b.id) === id) || null;
  }, [branchId, branches]);

  const filteredBranches = useMemo(() => {
    const q = branchQuery.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) => String(b.branches_nm || "").toLowerCase().includes(q));
  }, [branches, branchQuery]);

  const suggestions = useMemo(() => {
    const selectedId = Number(branchId);
    const list = filteredBranches.filter((b) => Number(b.id) !== selectedId);
    return list.slice(0, 50);
  }, [filteredBranches, branchId]);

  useEffect(() => {
    if (!branchPickerOpen) return;
    setActiveSuggestionIndex(0);
  }, [branchPickerOpen, branchQuery]);

  useEffect(() => {
    if (!branchPickerOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setBranchPickerOpen(false);
    };
    const onMouseDown = (e) => {
      const box = branchBoxRef.current;
      if (!box) return;
      if (!box.contains(e.target)) setBranchPickerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [branchPickerOpen]);

  const selectBranch = (b) => {
    if (!b?.id) return;
    setBranchId(String(b.id));
    setBranchQuery(b.branches_nm || "");
    setBranchPickerOpen(false);
  };

  const onBranchKeyDown = (e) => {
    if (!branchPickerOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((i) => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      if (suggestions[activeSuggestionIndex]) {
        e.preventDefault();
        selectBranch(suggestions[activeSuggestionIndex]);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const response = await api.post("auth/login/", {
        email,
        password,
        branch_id: Number(branchId),
      });
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      if (response.data.user && response.data.branch) {
        setSession({ user: response.data.user, branch: response.data.branch });
      } else if (selectedBranch) {
        setSession({ user: response.data.user || null, branch: selectedBranch });
      }
      navigate("/dashboard");
    } catch (error) {
      const detail = error?.response?.data?.detail;
      const branchErr = error?.response?.data?.branch_id;
      if (Array.isArray(branchErr) && branchErr[0]) setErr(String(branchErr[0]));
      else setErr(String(detail || "Sign in failed. Check email, password, and branch."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl">
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-blue-500/25 via-indigo-500/20 to-cyan-500/25 blur-3xl" />

        <div className="relative w-full rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-8 space-y-8">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c.828 0 1.5.672 1.5 1.5S12.828 14 12 14s-1.5-.672-1.5-1.5S11.172 11 12 11Zm6-4V6a6 6 0 1 0-12 0v1H5a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1h-1Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Sign in</h2>
              <p className="text-sm text-blue-100/80">Access your workspace securely</p>
            </div>
          </div>

          {err && (
            <div
              className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-red-100"
              role="alert"
            >
              <svg className="h-5 w-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"/>
              </svg>
              <span className="text-sm">{err}</span>
            </div>
          )}

          {branchesErr && (
            <div
              className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-amber-100"
              role="status"
            >
              <svg className="h-5 w-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm">{branchesErr}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-blue-100">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-blue-100/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12A4 4 0 1 1 8 12a4 4 0 0 1 8 0Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14c-3.314 0-6 2.239-6 5h12c0-2.761-2.686-5-6-5z"/>
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
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="branch" className="text-sm font-medium text-blue-100">
                Branch
              </label>
              <div className="relative" ref={branchBoxRef}>
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-blue-100/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 6h10M7 14h10M5 18h14" />
                  </svg>
                </span>
                <input
                  id="branch"
                  className="w-full pl-10 pr-20 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-blue-100/60
                             focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                  value={branchQuery}
                  onChange={(e) => {
                    setBranchQuery(e.target.value);
                    setBranchId("");
                    setBranchPickerOpen(true);
                  }}
                  onFocus={() => setBranchPickerOpen(true)}
                  onKeyDown={onBranchKeyDown}
                  placeholder={branchesLoading ? "Loading branches…" : "Search and select a branch"}
                  disabled={branchesLoading}
                  role="combobox"
                  aria-expanded={branchPickerOpen}
                  aria-controls="branch-suggestions"
                  aria-autocomplete="list"
                  autoComplete="off"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                  {branchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setBranchQuery("");
                        setBranchId("");
                        setBranchPickerOpen(true);
                      }}
                      className="h-9 w-9 inline-flex items-center justify-center rounded-md text-blue-100/80 hover:text-white hover:bg-white/10 focus:outline-none"
                      aria-label="Clear branch"
                      disabled={branchesLoading}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setBranchPickerOpen((s) => !s)}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-md text-blue-100/80 hover:text-white hover:bg-white/10 focus:outline-none"
                    aria-label="Toggle branch list"
                    disabled={branchesLoading}
                  >
                    <svg className={`h-5 w-5 transition-transform ${branchPickerOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {branchPickerOpen && !branchesLoading && (
                  <div
                    className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-blue-950/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="max-h-60 overflow-auto" id="branch-suggestions" role="listbox">
                      {suggestions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-blue-100/80">
                          {branchQuery.trim() ? "No matches." : "Type to search branches."}
                        </div>
                      ) : (
                        <ul className="divide-y divide-white/10">
                          {suggestions.map((b, idx) => {
                            const active = idx === activeSuggestionIndex;
                            return (
                              <li key={b.id} role="option" aria-selected={active}>
                                <button
                                  type="button"
                                  onClick={() => selectBranch(b)}
                                  className={`w-full text-left px-4 py-3 hover:bg-blue-900/40 ${
                                    active ? "bg-blue-900/30" : ""
                                  }`}
                                >
                                  <div className="text-sm font-medium text-white">{b.branches_nm}</div>
                                  <div className="text-[11px] text-blue-100/70">#{b.id}</div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between gap-2 bg-white/5">
                      <div className="text-[11px] text-blue-100/70">
                        Showing {Math.min(suggestions.length, 50)} of {filteredBranches.length}
                      </div>
                      <button
                        type="button"
                        className="text-[11px] font-medium text-blue-100/90 hover:text-white"
                        onClick={() => setBranchPickerOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {selectedBranch && (
                <div className="text-[11px] text-blue-100/70">
                  Selected: <span className="text-blue-100/90">{selectedBranch.branches_nm}</span>
                </div>
              )}
            </div>

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
                  autoComplete="current-password"
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
              <div className="flex items-center justify-between text-xs mt-1">
                <label className="inline-flex items-center gap-2 text-blue-100/80 select-none">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-400 focus:ring-blue-400/60" />
                  Remember me
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || branchesLoading || !branchId}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500
                         hover:from-blue-500/90 hover:to-indigo-500/90 active:scale-[0.99]
                         text-white py-3 rounded-lg font-medium shadow-lg shadow-blue-900/30
                         focus:outline-none focus:ring-4 focus:ring-blue-400/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Sign In</>
              )}
            </button>

            <div className="pt-1 text-[11px] text-center text-blue-100/70">
              Secure access. Unauthorized use is prohibited.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
