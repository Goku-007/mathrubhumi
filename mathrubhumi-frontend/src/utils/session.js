const SESSION_KEY = "mb_session";

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { user: null, branch: null };
    const parsed = JSON.parse(raw);
    return {
      user: parsed?.user || null,
      branch: parsed?.branch || null,
    };
  } catch {
    return { user: null, branch: null };
  }
}

export function setSession({ user, branch }) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      user: user || null,
      branch: branch || null,
      updatedAt: Date.now(),
    })
  );
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getInitials(nameOrEmail = "") {
  const v = String(nameOrEmail || "").trim();
  if (!v) return "U";
  const parts = v.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (v.includes("@")) return v[0].toUpperCase();
  return v.slice(0, 2).toUpperCase();
}

