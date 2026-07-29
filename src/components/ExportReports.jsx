import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = {
  bg: "#0A0A0A",
  surface: "#151515",
  accent: "#22C55E",
  secondary: "#A0A0A0",
  text: "#FFFFFF",
  border: "#252525",
  surfaceHover: "#1C1C1C",
  accentDim: "rgba(255, 255, 255, 0.06)",
};

const EXPORT_TYPES = [
  { id: "workouts", label: "Workout History", icon: "" },
  { id: "nutrition", label: "Nutrition", icon: "" },
  { id: "progress", label: "Progress", icon: "" },
  { id: "running", label: "Running", icon: "" },
];

const FORMAT_OPTIONS = [
  { id: "pdf", label: "PDF" },
  { id: "csv", label: "CSV" },
];

const fmt2 = (n, d = 2) => Number(n || 0).toFixed(d);
const fmtDate = (d) => {
  if (!d) return "";
  return d.length === 10 ? d : new Date(d).toISOString().slice(0, 10);
};
const fmtDuration = (min) => {
  if (!min) return "0m";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
const fmtPace = (s) => {
  if (!s) return "--:--";
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

function filterByDateRange(items, from, to) {
  return items.filter((item) => {
    const d = fmtDate(item.date);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

function getWorkoutVolume(w) {
  if (w.totalVolume) return Math.round(w.totalVolume);
  return (w.exercises || []).reduce(
    (sum, ex) => sum + (ex.sets || []).reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0),
    0
  );
}

const exportWorkoutPDF = (workouts, from, to, userName) => {
  const doc = new jsPDF();
  const filtered = filterByDateRange(workouts, from, to);

  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("Workout History Report", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`User: ${userName || "Athlete"}`, 14, 30);
  doc.text(`Date Range: ${from || "Start"} to ${to || "End"}`, 14, 36);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42);

  const tableData = filtered.map((w) => [
    fmtDate(w.date),
    w.name || "Workout",
    (w.exercises || []).length,
    `${getWorkoutVolume(w)} kg`,
    fmtDuration(w.duration),
  ]);

  autoTable(doc, {
    startY: 48,
    head: [["Date", "Workout Name", "Exercises", "Total Volume", "Duration"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [34, 197, 94], textColor: [10, 10, 10], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Summary", 14, finalY);

  const totalVol = filtered.reduce((s, w) => s + getWorkoutVolume(w), 0);
  const avgDuration = filtered.length ? Math.round(filtered.reduce((s, w) => s + (w.duration || 0), 0) / filtered.length) : 0;

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(`Total Workouts: ${filtered.length}`, 14, finalY + 8);
  doc.text(`Total Volume: ${totalVol.toLocaleString()} kg`, 14, finalY + 14);
  doc.text(`Average Duration: ${fmtDuration(avgDuration)}`, 14, finalY + 20);

  doc.save(`workout-history-${from || "all"}-to-${to || "all"}.pdf`);
};

const exportWorkoutCSV = (workouts, from, to) => {
  const filtered = filterByDateRange(workouts, from, to);
  const headers = ["Date", "Name", "Exercises", "Volume (kg)", "Duration (min)"];
  const rows = filtered.map((w) => [
    fmtDate(w.date),
    w.name || "Workout",
    (w.exercises || []).length,
    getWorkoutVolume(w),
    w.duration || 0,
  ]);
  downloadCSV([headers, ...rows], `workout-history-${from || "all"}-to-${to || "all"}.csv`);
};

const exportNutritionPDF = (nutrition, from, to, userName) => {
  const doc = new jsPDF();
  const filtered = filterByDateRange(nutrition, from, to);

  doc.setFontSize(20);
  doc.text("Nutrition Report", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`User: ${userName || "Athlete"}`, 14, 30);
  doc.text(`Date Range: ${from || "Start"} to ${to || "End"}`, 14, 36);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42);

  const tableData = filtered.map((n) => [
    fmtDate(n.date),
    n.food || n.name || "Unknown",
    n.meal || n.mealType || "-",
    n.calories || 0,
    `${n.protein || 0}g`,
    `${n.carbs || 0}g`,
    `${n.fat || 0}g`,
  ]);

  autoTable(doc, {
    startY: 48,
    head: [["Date", "Food", "Meal Type", "Calories", "Protein", "Carbs", "Fat"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [34, 197, 94], textColor: [10, 10, 10], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Summary", 14, finalY);

  const totalCal = filtered.reduce((s, n) => s + (n.calories || 0), 0);
  const totalProtein = filtered.reduce((s, n) => s + (n.protein || 0), 0);
  const totalCarbs = filtered.reduce((s, n) => s + (n.carbs || 0), 0);
  const totalFat = filtered.reduce((s, n) => s + (n.fat || 0), 0);
  const days = [...new Set(filtered.map((n) => fmtDate(n.date)))].length || 1;

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(`Total Calories: ${totalCal.toLocaleString()} kcal`, 14, finalY + 8);
  doc.text(`Avg Protein/Day: ${Math.round(totalProtein / days)}g`, 14, finalY + 14);
  doc.text(`Avg Carbs/Day: ${Math.round(totalCarbs / days)}g`, 14, finalY + 20);
  doc.text(`Avg Fat/Day: ${Math.round(totalFat / days)}g`, 14, finalY + 26);

  doc.save(`nutrition-${from || "all"}-to-${to || "all"}.pdf`);
};

const exportNutritionCSV = (nutrition, from, to) => {
  const filtered = filterByDateRange(nutrition, from, to);
  const headers = ["Date", "Food", "Meal", "Calories", "Protein", "Carbs", "Fat"];
  const rows = filtered.map((n) => [
    fmtDate(n.date),
    n.food || n.name || "Unknown",
    n.meal || n.mealType || "-",
    n.calories || 0,
    n.protein || 0,
    n.carbs || 0,
    n.fat || 0,
  ]);
  downloadCSV([headers, ...rows], `nutrition-${from || "all"}-to-${to || "all"}.csv`);
};

const exportProgressPDF = (bodyWeight, personalRecords, userName) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Progress Report", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`User: ${userName || "Athlete"}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);

  const bwData = (bodyWeight || []).map((w) => [fmtDate(w.date), `${fmt2(w.weight, 1)} kg`]);
  if (bwData.length) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("Body Weight Log", 14, 46);
    autoTable(doc, {
      startY: 50,
      head: [["Date", "Weight"]],
      body: bwData,
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94], textColor: [10, 10, 10], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
  }

  const prs = personalRecords || {};
  const prEntries = Object.entries(prs);
  if (prEntries.length) {
    const prY = (doc.lastAutoTable?.finalY || 50) + 12;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("Personal Records (e1RM)", 14, prY);
    autoTable(doc, {
      startY: prY + 4,
      head: [["Exercise", "Weight", "Reps", "e1RM", "Date"]],
      body: prEntries.map(([, pr]) => [
        pr.name || "Exercise",
        `${pr.weight || 0} kg`,
        pr.reps || 0,
        `${fmt2(pr.e1rm, 1)} kg`,
        fmtDate(pr.date),
      ]),
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94], textColor: [10, 10, 10], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
  }

  const summaryY = (doc.lastAutoTable?.finalY || 60) + 12;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "bold");
  doc.text("Body Weight Trend Summary", 14, summaryY);

  const weights = (bodyWeight || []).map((w) => w.weight).filter(Boolean);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  if (weights.length >= 2) {
    const first = weights[0];
    const last = weights[weights.length - 1];
    const change = last - first;
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    doc.text(`Starting Weight: ${fmt2(first, 1)} kg`, 14, summaryY + 8);
    doc.text(`Current Weight: ${fmt2(last, 1)} kg`, 14, summaryY + 14);
    doc.text(`Change: ${change >= 0 ? "+" : ""}${fmt2(change, 1)} kg`, 14, summaryY + 20);
    doc.text(`Range: ${fmt2(minW, 1)} - ${fmt2(maxW, 1)} kg`, 14, summaryY + 26);
    doc.text(`Data Points: ${weights.length}`, 14, summaryY + 32);
  } else if (weights.length === 1) {
    doc.text(`Current Weight: ${fmt2(weights[0], 1)} kg`, 14, summaryY + 8);
  } else {
    doc.text("No body weight data available.", 14, summaryY + 8);
  }

  doc.save(`progress-report.pdf`);
};

const exportRunningPDF = (runs, from, to, userName) => {
  const doc = new jsPDF();
  const filtered = filterByDateRange(runs, from, to);

  doc.setFontSize(20);
  doc.text("Running Report", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`User: ${userName || "Athlete"}`, 14, 30);
  doc.text(`Date Range: ${from || "Start"} to ${to || "End"}`, 14, 36);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42);

  const tableData = filtered.map((r) => [
    fmtDate(r.date),
    `${fmt2(r.distance, 2)} km`,
    fmtDuration(r.duration),
    `${fmtPace(r.avgPace)} /km`,
    `${r.calories || 0} kcal`,
  ]);

  autoTable(doc, {
    startY: 48,
    head: [["Date", "Distance (km)", "Duration", "Avg Pace", "Calories"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [34, 197, 94], textColor: [10, 10, 10], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "bold");
  doc.text("Summary", 14, finalY);

  const totalDist = filtered.reduce((s, r) => s + (r.distance || 0), 0);
  const totalCal = filtered.reduce((s, r) => s + (r.calories || 0), 0);
  const avgPace = filtered.length
    ? Math.round(filtered.reduce((s, r) => s + (r.avgPace || 0), 0) / filtered.length)
    : 0;

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(`Total Runs: ${filtered.length}`, 14, finalY + 8);
  doc.text(`Total Distance: ${fmt2(totalDist, 2)} km`, 14, finalY + 14);
  doc.text(`Average Pace: ${fmtPace(avgPace)} /km`, 14, finalY + 20);
  doc.text(`Total Calories: ${totalCal.toLocaleString()} kcal`, 14, finalY + 26);

  doc.save(`running-${from || "all"}-to-${to || "all"}.pdf`);
};

const exportRunningCSV = (runs, from, to) => {
  const filtered = filterByDateRange(runs, from, to);
  const headers = ["Date", "Distance (km)", "Duration (min)", "Avg Pace (s/km)", "Calories"];
  const rows = filtered.map((r) => [
    fmtDate(r.date),
    fmt2(r.distance, 2),
    r.duration || 0,
    r.avgPace || 0,
    r.calories || 0,
  ]);
  downloadCSV([headers, ...rows], `running-${from || "all"}-to-${to || "all"}.csv`);
};

function downloadCSV(rows, filename) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportReports({ state, dispatch }) {
  const [exportType, setExportType] = useState("workouts");
  const [format, setFormat] = useState("pdf");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exportHistory, setExportHistory] = useState([]);
  const [exporting, setExporting] = useState(false);

  const userName = state?.profile?.name || "Athlete";
  const workouts = state?.workouts || [];
  const nutrition = state?.nutrition || [];
  const bodyWeight = state?.bodyWeight || [];
  const runs = state?.runs || [];
  const personalRecords = state?.personalRecords || {};

  const preview = useMemo(() => {
    switch (exportType) {
      case "workouts": {
        const filtered = filterByDateRange(workouts, from, to);
        const totalVol = filtered.reduce((s, w) => s + getWorkoutVolume(w), 0);
        return {
          count: filtered.length,
          stats: [
            { label: "Workouts", value: filtered.length },
            { label: "Total Volume", value: `${totalVol.toLocaleString()} kg` },
            { label: "Avg Duration", value: fmtDuration(filtered.length ? Math.round(filtered.reduce((s, w) => s + (w.duration || 0), 0) / filtered.length) : 0) },
          ],
          empty: filtered.length === 0,
        };
      }
      case "nutrition": {
        const filtered = filterByDateRange(nutrition, from, to);
        const days = [...new Set(filtered.map((n) => fmtDate(n.date)))].length || 1;
        const totalCal = filtered.reduce((s, n) => s + (n.calories || 0), 0);
        return {
          count: filtered.length,
          stats: [
            { label: "Entries", value: filtered.length },
            { label: "Total Calories", value: `${totalCal.toLocaleString()} kcal` },
            { label: "Avg Protein/Day", value: `${Math.round(filtered.reduce((s, n) => s + (n.protein || 0), 0) / days)}g` },
          ],
          empty: filtered.length === 0,
        };
      }
      case "progress": {
        const weights = bodyWeight.map((w) => w.weight).filter(Boolean);
        const prCount = Object.keys(personalRecords).length;
        return {
          count: bodyWeight.length + prCount,
          stats: [
            { label: "Weight Entries", value: bodyWeight.length },
            { label: "Personal Records", value: prCount },
            { label: "Current Weight", value: weights.length ? `${fmt2(weights[weights.length - 1], 1)} kg` : "N/A" },
          ],
          empty: bodyWeight.length === 0 && prCount === 0,
        };
      }
      case "running": {
        const filtered = filterByDateRange(runs, from, to);
        const totalDist = filtered.reduce((s, r) => s + (r.distance || 0), 0);
        const avgPace = filtered.length ? Math.round(filtered.reduce((s, r) => s + (r.avgPace || 0), 0) / filtered.length) : 0;
        return {
          count: filtered.length,
          stats: [
            { label: "Total Runs", value: filtered.length },
            { label: "Total Distance", value: `${fmt2(totalDist, 2)} km` },
            { label: "Avg Pace", value: `${fmtPace(avgPace)} /km` },
          ],
          empty: filtered.length === 0,
        };
      }
      default:
        return { count: 0, stats: [], empty: true };
    }
  }, [exportType, from, to, workouts, nutrition, bodyWeight, runs, personalRecords]);

  const handleExport = () => {
    setExporting(true);
    const entry = {
      id: Date.now(),
      type: exportType,
      format: format.toUpperCase(),
      date: new Date().toLocaleString(),
      range: from && to ? `${from} to ${to}` : from ? `From ${from}` : to ? `Up to ${to}` : "All time",
      count: preview.count,
    };

    setTimeout(() => {
      try {
        switch (exportType) {
          case "workouts":
            format === "pdf" ? exportWorkoutPDF(workouts, from, to, userName) : exportWorkoutCSV(workouts, from, to);
            break;
          case "nutrition":
            format === "pdf" ? exportNutritionPDF(nutrition, from, to, userName) : exportNutritionCSV(nutrition, from, to);
            break;
          case "progress":
            format === "pdf" ? exportProgressPDF(bodyWeight, personalRecords, userName) : exportProgressCSV(bodyWeight, personalRecords);
            break;
          case "running":
            format === "pdf" ? exportRunningPDF(runs, from, to, userName) : exportRunningCSV(runs, from, to);
            break;
        }
        setExportHistory((prev) => [entry, ...prev].slice(0, 10));
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setExporting(false);
      }
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "0 0 40px", maxWidth: 800, margin: "0 auto" }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>
          Export Reports
        </h1>
        <p style={{ fontSize: 13, color: COLORS.secondary }}>
          Export your fitness data as PDF or CSV
        </p>
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.secondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10, display: "block" }}>
            Data Type
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {EXPORT_TYPES.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExportType(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: exportType === t.id ? COLORS.accentDim : COLORS.bg,
                  border: `1px solid ${exportType === t.id ? COLORS.accent : COLORS.border}`,
                  color: exportType === t.id ? COLORS.accent : COLORS.secondary,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                {t.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.secondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10, display: "block" }}>
            Date Range
          </label>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <span style={{ fontSize: 11, color: COLORS.secondary, marginTop: 4, display: "block" }}>From</span>
            </div>
            <span style={{ color: COLORS.secondary, fontSize: 13, marginTop: 14 }}>to</span>
            <div style={{ flex: 1 }}>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <span style={{ fontSize: 11, color: COLORS.secondary, marginTop: 4, display: "block" }}>To</span>
            </div>
            {(from || to) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setFrom(""); setTo(""); }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.secondary,
                  fontSize: 12,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  marginTop: 14,
                }}
              >
                Clear
              </motion.button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.secondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10, display: "block" }}>
            Format
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            {FORMAT_OPTIONS.map((f) => (
              <motion.button
                key={f.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormat(f.id)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: format === f.id ? COLORS.accentDim : COLORS.bg,
                  border: `1px solid ${format === f.id ? COLORS.accent : COLORS.border}`,
                  color: format === f.id ? COLORS.accent : COLORS.secondary,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.secondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10, display: "block" }}>
            Preview
          </label>
          <div style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 16,
          }}>
            {preview.empty ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}></span>
                <span style={{ fontSize: 13, color: COLORS.secondary }}>No data found for the selected range</span>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {preview.stats.map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.accent, marginBottom: 2 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.secondary }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <motion.button
          whileHover={!preview.empty ? { scale: 1.02, y: -1 } : {}}
          whileTap={!preview.empty ? { scale: 0.98 } : {}}
          onClick={handleExport}
          disabled={preview.empty || exporting}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: 12,
            background: preview.empty ? COLORS.surfaceHover : COLORS.accent,
            color: preview.empty ? COLORS.secondary : COLORS.bg,
            fontSize: 14,
            fontWeight: 800,
            cursor: preview.empty ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s",
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block", width: 16, height: 16, border: `2px solid ${COLORS.bg}`, borderTopColor: "transparent", borderRadius: "50%" }}
            />
          ) : (
            ""
          )}
          {exporting ? "Exporting..." : `Export ${format.toUpperCase()}`}
        </motion.button>
      </div>

      <AnimatePresence>
        {exportHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>
              Recent Exports
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {exportHistory.map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: COLORS.bg,
                    borderRadius: 10,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 16 }}>
                      {EXPORT_TYPES.find((t) => t.id === e.type)?.icon}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                        {EXPORT_TYPES.find((t) => t.id === e.type)?.label}
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.secondary }}>
                        {e.range} · {e.count} records
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: e.format === "PDF" ? "rgba(239, 68, 68, 0.15)" : "rgba(46, 213, 115, 0.15)",
                      color: e.format === "PDF" ? "#EF4444" : "#2ED573",
                    }}>
                      {e.format}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.secondary, marginTop: 4 }}>
                      {e.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
