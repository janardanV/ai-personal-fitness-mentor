export const fmt = (n, dec = 0) => Number(n).toFixed(dec);
export const today = () => new Date().toISOString().split("T")[0];
export const weekAgo = () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split("T")[0]; };
export const uid = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

export const fmtPace = (minPerKm) => {
  if (!minPerKm || !isFinite(minPerKm) || minPerKm <= 0) return "--:--";
  const min = Math.floor(minPerKm);
  const sec = Math.round((minPerKm - min) * 60);
  if (sec === 60) return `${min + 1}:00`;
  return `${min}:${String(sec).padStart(2, "0")}`;
};

export const fmtDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const fmtDurationLong = (seconds) => {
  if (!seconds || seconds <= 0) return "0h 0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
