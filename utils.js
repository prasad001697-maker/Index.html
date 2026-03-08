// ── Utility / Helper Functions ──────────────────────────

export const INITIAL_SUBJECTS = [
  { id: 1, name: "Mathematics", attended: 18, total: 22 },
  { id: 2, name: "Physics", attended: 15, total: 20 },
  { id: 3, name: "Chemistry", attended: 12, total: 18 },
  { id: 4, name: "English", attended: 20, total: 22 },
  { id: 5, name: "Computer Science", attended: 17, total: 19 },
];

export const DEMO_USER = { name: "Demo User", rollNo: "21CSE001" };

export const C = {
  bg: "#0a0a0f", card: "#111118", border: "#1e1e2e",
  accent: "#7c6af5", accentGlow: "#7c6af580",
  green: "#22c55e", red: "#ef4444", yellow: "#f59e0b",
  text: "#e2e8f0", muted: "#64748b",
};

export function pct(attended, total) {
  return total ? Math.round((attended / total) * 100) : 0;
}

export function getStatus(p) {
  if (p >= 85) return { label: "Safe", color: C.green };
  if (p >= 75) return { label: "OK", color: C.yellow };
  return { label: "Danger", color: C.red };
}

export function canBunk(a, t) {
  let b = 0;
  while (((a) / (t + b + 1)) * 100 >= 75 && b < 200) b++;
  return b;
}

export function needMore(a, t) {
  if (pct(a, t) >= 75) return 0;
  let n = 0;
  while (((a + n) / (t + n)) * 100 < 75 && n < 300) n++;
  return n;
}