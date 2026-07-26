import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import React from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";

// ── Constants ───────────────────────────────────────────────────────────────
const RUNNING_BADGE_DEFS = [
  { id: "first_run", icon: "🏃", label: "First Run", desc: "Complete your first run" },
  { id: "run_5k", icon: "🏅", label: "5K Runner", desc: "Run 5 km in a single session" },
  { id: "run_10k", icon: "🥇", label: "10K Champion", desc: "Run 10 km in a single session" },
  { id: "half_marathon", icon: "🥈", label: "Half Marathon", desc: "Run 21.1 km in a single session" },
  { id: "marathon", icon: "🏆", label: "Marathon Finisher", desc: "Run 42.2 km in a single session" },
  { id: "speed_demon", icon: "⚡", label: "Speed Demon", desc: "Achieve pace faster than 4:30/km" },
  { id: "streak_3", icon: "🔥", label: "3-Day Streak", desc: "Run 3 consecutive days" },
  { id: "streak_7", icon: "🔥", label: "7-Day Streak", desc: "Run 7 consecutive days" },
  { id: "total_100km", icon: "💯", label: "Century KM", desc: "Run a total of 100 km" },
  { id: "total_500km", icon: "🌟", label: "500KM Club", desc: "Run a total of 500 km" },
  { id: "early_bird", icon: "🌅", label: "Early Bird", desc: "Run before 7 AM" },
  { id: "night_runner", icon: "🌙", label: "Night Runner", desc: "Run after 9 PM" },
  { id: "calorie_burner", icon: "🔥", label: "Calorie Burner", desc: "Burn 1000 calories in one run" },
  { id: "ten_runs", icon: "💪", label: "10 Runs", desc: "Complete 10 runs" },
  { id: "fifty_runs", icon: "🎖️", label: "50 Runs", desc: "Complete 50 runs" },
];

const MOCK_RUN_COACHING = {
  post_run: [
    "Great run! Your average pace improved compared to your last session. Keep pushing!",
    "Solid effort! Try to maintain a more consistent pace throughout — you slowed down in the last third.",
    "Nice work! Your cadence is improving. Focus on landing under your center of mass for better efficiency.",
    "Good session! Consider adding intervals next week to work on your top speed.",
    "Well done! Your endurance is clearly improving. You're on track for your distance goals.",
    "Strong run! I noticed your pace dropped after 3km — try to pace yourself better at the start.",
    "Excellent effort! Your heart rate stayed controlled, meaning your cardiovascular fitness is improving.",
    "Great consistency! Keep this up and you'll be smashing your goals in no time.",
  ],
  tips: [
    "Try to increase your cadence to 170-180 spm for better running economy.",
    "Recovery run recommended tomorrow — keep it easy and conversational.",
    "Hydrate well before your next run. Aim for 500ml in the 2 hours before.",
    "Consider a warm-up of 5 minutes of easy jogging before your main run.",
    "Your long run pace should be 60-90 seconds slower than your 5K race pace.",
    "Try the 80/20 rule: 80% easy running, 20% hard effort for optimal improvement.",
    "Stretch your hip flexors after every run to prevent common running injuries.",
    "Wear properly fitted running shoes to reduce impact and improve performance.",
    "After hard runs, consume protein within 30 minutes for optimal muscle recovery.",
    "Include one tempo run per week to improve your lactate threshold.",
  ],
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt2 = (n, dec = 0) => Number(n).toFixed(dec);
const fmtPace = (minPerKm) => {
  if (!minPerKm || !isFinite(minPerKm) || minPerKm <= 0) return "--:--";
  const min = Math.floor(minPerKm);
  const sec = Math.round((minPerKm - min) * 60);
  if (sec === 60) return `${min + 1}:00`;
  return `${min}:${String(sec).padStart(2, "0")}`;
};
const fmtDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
const fmtDurationLong = (seconds) => {
  if (!seconds || seconds <= 0) return "0h 0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const calcCalories = (distanceKm, durationSeconds, weightKg = 70) => {
  const hours = durationSeconds / 3600;
  const speed = distanceKm / (hours || 0.001);
  let met = 8.0;
  if (speed >= 16) met = 16.0;
  else if (speed >= 14) met = 13.5;
  else if (speed >= 12.5) met = 12.0;
  else if (speed >= 11) met = 11.0;
  else if (speed >= 10) met = 9.8;
  else if (speed >= 8) met = 8.3;
  else if (speed >= 6.5) met = 7.0;
  else if (speed >= 5) met = 6.0;
  else if (speed >= 4) met = 4.5;
  else met = 3.5;
  return Math.round(0.0175 * met * weightKg * (durationSeconds / 60));
};

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calcTotalDistance = (coords) => {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversine(coords[i - 1].lat, coords[i - 1].lng, coords[i].lat, coords[i].lng);
  }
  return total;
};

const getRunningStreak = (runs) => {
  const days = [...new Set(runs.map((r) => r.date))].sort().reverse();
  let streak = 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = 0; i < days.length; i++) {
    const d = new Date(days[i]);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((now - d) / 86400000);
    if (diff === streak) streak++;
    else break;
  }
  return streak;
};

const generateMockHeartRate = (pace, duration) => {
  const baseHR = pace < 5 ? 170 : pace < 6 ? 155 : pace < 7 ? 142 : 130;
  return {
    avg: Math.round(baseHR + Math.random() * 8),
    max: Math.round(baseHR + 15 + Math.random() * 10),
  };
};

const generateSplits = (distance, duration, route) => {
  const splits = [];
  const totalKm = Math.floor(distance);
  for (let km = 1; km <= totalKm; km++) {
    const fraction = km / totalKm;
    const splitDuration = (duration / totalKm) * (0.9 + Math.random() * 0.2);
    splits.push({
      km,
      pace: 60 / (distance / (duration / 60) * (0.95 + Math.random() * 0.1)),
      duration: splitDuration,
    });
  }
  return splits;
};

const today = () => new Date().toISOString().split("T")[0];

const generateAIReport = (run, prevRun) => {
  const feedback = pick(MOCK_RUN_COACHING.post_run);
  const tips = [];
  if (run.avgPace < 7) tips.push("Your pace is solid. Focus on endurance to maintain this over longer distances.");
  if (run.distance < 3) tips.push("Try gradually increasing your distance by 10% each week for safe progression.");
  if (run.avgPace > 8) tips.push("Consider run/walk intervals to gradually build your endurance and speed.");
  if (tips.length === 0) tips.push(pick(MOCK_RUN_COACHING.tips));
  if (prevRun && run.avgPace < prevRun.avgPace) {
    tips.unshift(`Great news! Your average pace improved by ${Math.round((prevRun.avgPace - run.avgPace) * 60)} seconds/km compared to your last session.`);
  }
  return { feedback, tips: tips.slice(0, 3) };
};

// ── RunningMode CSS (injected) ──────────────────────────────────────────────
const RUNNING_STYLES = `
  @keyframes runPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(200,255,0,0.3); } 50% { box-shadow: 0 0 0 12px rgba(200,255,0,0); } }
  @keyframes runGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
  .run-live-pulse { animation: runPulse 2s ease-in-out infinite; }
  .run-glow { animation: runGlow 2s ease-in-out infinite; }
`;

// ── Reusable Running Components ─────────────────────────────────────────────
const RunMetricCard = ({ icon, label, value, unit, color = "#C8FF00", sub }) => (
  <div className="run-metric-card" style={{ "--accent": color }}>
    <div className="run-metric-icon" style={{ background: `${color}15` }}>{icon}</div>
    <div className="run-metric-value" style={{ color }}>{value}<span style={{ fontSize: 12, fontWeight: 400, color: "#A0A0A0", marginLeft: 4 }}>{unit}</span></div>
    <div className="run-metric-label">{label}</div>
    {sub && <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 4 }}>{sub}</div>}
  </div>
);

const RunControlBtn = ({ onClick, className, children, disabled, style }) => (
  <button className={`run-control-btn ${className}`} onClick={onClick} disabled={disabled} style={{ ...style, opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>{children}</button>
);

const SectionTitle = ({ children }) => (
  <div className="dash-section-title" style={{ marginTop: 24 }}><span className="st-dot" />{children}</div>
);

const TabBar = ({ tabs, active, onChange }) => (
  <div className="wm-tab-bar" style={{ marginBottom: 20 }}>
    {tabs.map((t) => (
      <button key={t.id} className={`wm-tab ${active === t.id ? "active" : ""}`} onClick={() => onChange(t.id)}>
        {t.icon && <span style={{ marginRight: 6 }}>{t.icon}</span>}{t.label}
      </button>
    ))}
  </div>
);

const EmptyState = ({ icon, title, desc, action }) => (
  <div className="wm-empty">
    <div className="wm-empty-icon">{icon}</div>
    <div className="wm-empty-title">{title}</div>
    <div className="wm-empty-desc">{desc}</div>
    {action}
  </div>
);

// ── Leaflet Map Component ───────────────────────────────────────────────────
const RunMap = ({ route, height = 300, showMarker = true, fitBounds = true }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(mapInstance.current);
      L.control.zoom({ position: "bottomright" }).addTo(mapInstance.current);
    }

    if (layerRef.current) {
      mapInstance.current.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (route && route.length > 0) {
      const latlngs = route.map((p) => [p.lat, p.lng]);
      layerRef.current = L.polyline(latlngs, {
        color: "#C8FF00",
        weight: 4,
        opacity: 0.85,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(mapInstance.current);

      if (showMarker && route.length > 0) {
        const startIcon = L.divIcon({
          html: '<div style="width:14px;height:14px;background:#00C853;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,200,83,0.4);"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          className: "",
        });
        const endIcon = L.divIcon({
          html: '<div style="width:14px;height:14px;background:#FF4757;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(255,71,87,0.4);"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          className: "",
        });
        L.marker(latlngs[0], { icon: startIcon }).addTo(mapInstance.current);
        L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(mapInstance.current);
      }

      if (fitBounds && route.length > 1) {
        mapInstance.current.fitBounds(layerRef.current.getBounds(), { padding: [30, 30] });
      } else if (route.length === 1) {
        mapInstance.current.setView([route[0].lat, route[0].lng], 15);
      }
    } else {
      mapInstance.current.setView([59.437, 24.7535], 13);
    }

    setTimeout(() => mapInstance.current?.invalidateSize(), 100);

    return () => {};
  }, [route, height]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="run-map-container" style={{ height }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      {!route || route.length === 0 ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(11,11,11,0.8)", zIndex: 500, pointerEvents: "none" }}>
          <div style={{ textAlign: "center", color: "#A0A0A0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Start a run to see your route</div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ── Live Stopwatch Hook ─────────────────────────────────────────────────────
const useStopwatch = () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const accumulatedRef = useRef(0);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current) / 1000);
    }, 100);
  }, []);

  const pause = useCallback(() => {
    accumulatedRef.current += (Date.now() - startTimeRef.current) / 1000;
    setRunning(false);
    clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
    accumulatedRef.current = 0;
    startTimeRef.current = null;
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    return accumulatedRef.current + (startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0);
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { elapsed, running, start, pause, reset, stop };
};

// ── Active Run View ─────────────────────────────────────────────────────────
const ActiveRun = ({ state, dispatch, onSummary, onCancel }) => {
  const { elapsed, running, start, pause, reset, stop } = useStopwatch();
  const [paused, setPaused] = useState(false);
  const [route, setRoute] = useState([]);
  const [gpsStatus, setGpsStatus] = useState("initializing");
  const [distance, setDistance] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [topSpeed, setTopSpeed] = useState(0);
  const [steps, setSteps] = useState(0);
  const [heartRate, setHeartRate] = useState({ avg: 0, max: 0, current: 0 });
  const [elevationGain, setElevationGain] = useState(0);
  const [mockHRCounter, setMockHRCounter] = useState(0);
  const watchIdRef = useRef(null);
  const lastPosRef = useRef(null);
  const weight = state.profile?.weight || 70;

  const pace = elapsed > 0 && distance > 0 ? (elapsed / 60) / distance : 0;
  const avgPace = pace;
  const speed = distance > 0 && elapsed > 0 ? (distance / (elapsed / 3600)) : 0;
  const calories = calcCalories(distance, elapsed, weight);
  const cadence = pace > 0 ? Math.min(200, Math.max(140, Math.round(180 - (pace - 5) * 8))) : 0;

  const gpsCallback = useCallback((pos) => {
    const { latitude, longitude, speed: gpsSpeed, altitude } = pos.coords;
    const newPos = { lat: latitude, lng: longitude, time: Date.now(), altitude: altitude || 0 };

    if (lastPosRef.current) {
      const d = haversine(lastPosRef.current.lat, lastPosRef.current.lng, latitude, longitude);
      if (d > 0.001 && d < 0.5) {
        setDistance((prev) => prev + d);
        setSteps((prev) => prev + Math.round(d * 1312));
        if (gpsSpeed && gpsSpeed * 3.6 > topSpeed) setTopSpeed(gpsSpeed * 3.6);
        setCurrentSpeed(gpsSpeed ? gpsSpeed * 3.6 : speed);
        if (altitude && lastPosRef.current.altitude && altitude > lastPosRef.current.altitude) {
          setElevationGain((prev) => prev + (altitude - lastPosRef.current.altitude));
        }
      }
    }
    lastPosRef.current = newPos;
    setRoute((prev) => [...prev, newPos]);
    setGpsStatus("active");
  }, [topSpeed, speed]);

  const gpsError = useCallback((err) => {
    if (err.code === 1) setGpsStatus("denied");
    else if (err.code === 2) setGpsStatus("unavailable");
    else setGpsStatus("timeout");
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(gpsCallback, gpsError, {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      });
      setTimeout(() => { if (gpsStatus === "initializing") setGpsStatus("searching"); }, 3000);
    } else {
      setGpsStatus("unavailable");
    }
    return () => { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, []);

  useEffect(() => {
    if (running && !paused) {
      const hrBase = pace > 0 ? Math.min(185, Math.max(100, 120 + (7 - pace) * 10)) : 110;
      const interval = setInterval(() => {
        setMockHRCounter((c) => c + 1);
        setHeartRate((prev) => {
          const jitter = Math.floor(Math.random() * 6) - 3;
          const current = hrBase + jitter;
          return {
            current,
            avg: prev.avg === 0 ? current : Math.round((prev.avg * (mockHRCounter) + current) / (mockHRCounter + 1)),
            max: Math.max(prev.max, current),
          };
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [running, paused, pace, mockHRCounter]);

  const handleStart = () => { start(); setPaused(false); };
  const handlePause = () => { pause(); setPaused(true); };
  const handleResume = () => { start(); setPaused(false); };

  const handleFinish = () => {
    const finalTime = stop();
    const finalDist = distance;
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

    const avgPaceVal = finalDist > 0 ? (finalTime / 60) / finalDist : 0;
    const fastestPace = route.length > 1 ? Math.min(...route.slice(1).map((_, i) => {
      const d = haversine(route[i].lat, route[i].lng, route[i + 1].lat, route[i + 1].lng);
      const t = (route[i + 1].time - route[i].time) / 1000;
      return d > 0.001 ? (t / 60) / d : Infinity;
    }).filter((p) => isFinite(p) && p > 0)) : avgPaceVal;
    const avgSpeedVal = finalDist > 0 && finalTime > 0 ? finalDist / (finalTime / 3600) : 0;

    const run = {
      id: Date.now(),
      date: today(),
      startTime: route[0]?.time ? new Date(route[0].time).toISOString() : new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: Math.round(finalTime),
      distance: finalDist,
      avgPace: avgPaceVal,
      fastestPace: isFinite(fastestPace) ? fastestPace : avgPaceVal,
      avgSpeed: avgSpeedVal,
      topSpeed: Math.max(topSpeed, avgSpeedVal),
      calories,
      steps,
      cadence,
      heartRateAvg: heartRate.avg,
      heartRateMax: heartRate.max,
      elevationGain,
      route,
      splits: generateSplits(finalDist, Math.round(finalTime), route),
    };
    onSummary(run);
  };

  const handleReset = () => {
    reset();
    setPaused(false);
    setRoute([]);
    setDistance(0);
    setCurrentSpeed(0);
    setTopSpeed(0);
    setSteps(0);
    setHeartRate({ avg: 0, max: 0, current: 0 });
    setElevationGain(0);
    setMockHRCounter(0);
    lastPosRef.current = null;
  };

  const gpsColor = gpsStatus === "active" ? "#00C853" : gpsStatus === "searching" || gpsStatus === "initializing" ? "#FFA500" : "#FF4757";
  const gpsLabel = { initializing: "Initializing GPS...", searching: "Searching for signal", active: "GPS Active", denied: "GPS Permission Denied", unavailable: "GPS Unavailable", timeout: "GPS Timeout" }[gpsStatus] || "Unknown";

  return (
    <div>
      {/* Map */}
      <div style={{ position: "relative", marginBottom: 20, borderRadius: 16, overflow: "hidden" }}>
        <RunMap route={route} height={320} showMarker={false} fitBounds={false} />
        {/* GPS Badge */}
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 500, background: "rgba(15,15,15,0.9)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8, border: `1px solid ${gpsColor}30` }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: gpsColor, boxShadow: `0 0 8px ${gpsColor}60` }} className={gpsStatus === "active" ? "run-glow" : ""} />
          <span style={{ fontSize: 11, fontWeight: 600, color: gpsColor }}>{gpsLabel}</span>
        </div>
        {/* Live pace overlay */}
        <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 500, background: "rgba(15,15,15,0.9)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "8px 14px", border: "1px solid rgba(200,255,0,0.1)" }}>
          <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pace</div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "#C8FF00" }}>{fmtPace(avgPace)}</div>
        </div>
      </div>

      {/* Live Display */}
      <div className="run-live-display" style={{ background: "#151515", borderRadius: 16, border: "1px solid rgba(200,255,0,0.08)", padding: "28px 20px", marginBottom: 20 }}>
        <div className="run-live-label">Current Pace</div>
        <div className="run-live-pace mono">{fmtPace(avgPace)}</div>
        <div className="mono" style={{ fontSize: 14, color: "#A0A0A0", marginTop: 8 }}>{fmtDuration(elapsed)}</div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <RunMetricCard icon="📏" label="Distance" value={fmt2(distance, 2)} unit="km" color="#C8FF00" />
        <RunMetricCard icon="⏱️" label="Duration" value={fmtDuration(elapsed)} unit="" color="#A0A0A0" />
        <RunMetricCard icon="📊" label="Avg Pace" value={fmtPace(avgPace)} unit="/km" color="#C8FF00" />
        <RunMetricCard icon="🔥" label="Calories" value={calories} unit="kcal" color="#FF4757" />
        <RunMetricCard icon="⚡" label="Speed" value={fmt2(speed, 1)} unit="km/h" color="#00C853" />
        <RunMetricCard icon="🚀" label="Top Speed" value={fmt2(topSpeed, 1)} unit="km/h" color="#FFA500" />
        <RunMetricCard icon="👣" label="Steps" value={steps.toLocaleString()} unit="" color="#A5E600" />
        <RunMetricCard icon="💫" label="Cadence" value={cadence} unit="spm" color="#D9FF4D" />
        <RunMetricCard icon="❤️" label="Heart Rate" value={heartRate.current || "--"} unit="bpm" color="#FF4757" sub={`Avg: ${heartRate.avg || "--"} | Max: ${heartRate.max || "--"}`} />
        <RunMetricCard icon="⛰️" label="Elevation" value={fmt2(elevationGain, 0)} unit="m" color="#00BCD4" />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {!running && elapsed === 0 ? (
          <RunControlBtn className="start" onClick={handleStart}>▶ Start Run</RunControlBtn>
        ) : (
          <>
            {!paused ? (
              <RunControlBtn className="pause" onClick={handlePause}>⏸ Pause</RunControlBtn>
            ) : (
              <RunControlBtn className="resume" onClick={handleResume}>▶ Resume</RunControlBtn>
            )}
            <RunControlBtn className="finish" onClick={handleFinish}>⏹ Finish</RunControlBtn>
            <RunControlBtn className="reset" onClick={handleReset} disabled={running}>↻ Reset</RunControlBtn>
          </>
        )}
        <RunControlBtn className="ghost" onClick={onCancel}>✕ Cancel</RunControlBtn>
      </div>
    </div>
  );
};

// ── Run Summary Overlay ─────────────────────────────────────────────────────
const RunSummary = ({ run, state, dispatch, onClose }) => {
  const prevRuns = (state.runs || []);
  const prevRun = prevRuns.length > 0 ? prevRuns[prevRuns.length - 1] : null;
  const report = useMemo(() => generateAIReport(run, prevRun), [run, prevRun]);
  const [isPR, setIsPR] = useState(false);

  useEffect(() => {
    const prs = state.runningPRs || {};
    let newPR = false;
    if (run.distance > (prs.longestDistance?.distance || 0)) newPR = true;
    if (run.duration > (prs.longestDuration?.duration || 0)) newPR = true;
    if (run.calories > (prs.highestCalories?.calories || 0)) newPR = true;
    if (run.avgPace > 0 && (!prs.fastest1km?.pace || run.avgPace < prs.fastest1km.pace)) newPR = true;
    setIsPR(newPR);
  }, [run, state.runningPRs]);

  const handleSave = () => {
    dispatch({ type: "SAVE_RUN", payload: run });
    onClose();
  };

  return (
    <div className="run-summary-overlay">
      <motion.div className="run-summary-card" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{isPR ? "🏆" : "🎉"}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 4 }}>Run Complete!</h2>
          {isPR && <div style={{ fontSize: 13, color: "#FFD700", fontWeight: 600 }}>New Personal Record!</div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div className="glass-sm" style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Distance</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "#C8FF00" }}>{fmt2(run.distance, 2)} <span style={{ fontSize: 12, color: "#A0A0A0" }}>km</span></div>
          </div>
          <div className="glass-sm" style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Time</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF" }}>{fmtDuration(run.duration)}</div>
          </div>
          <div className="glass-sm" style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Pace</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "#C8FF00" }}>{fmtPace(run.avgPace)} <span style={{ fontSize: 12, color: "#A0A0A0" }}>/km</span></div>
          </div>
          <div className="glass-sm" style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fastest Pace</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "#00C853" }}>{fmtPace(run.fastestPace)} <span style={{ fontSize: 12, color: "#A0A0A0" }}>/km</span></div>
          </div>
          <div className="glass-sm" style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Calories</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "#FF4757" }}>{run.calories} <span style={{ fontSize: 12, color: "#A0A0A0" }}>kcal</span></div>
          </div>
          <div className="glass-sm" style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Speed</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "#00C853" }}>{fmt2(run.avgSpeed, 1)} <span style={{ fontSize: 12, color: "#A0A0A0" }}>km/h</span></div>
          </div>
        </div>

        {/* Splits */}
        {run.splits && run.splits.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div className="dash-section-title" style={{ fontSize: 13, marginBottom: 10 }}><span className="st-dot" />Splits</div>
            <div className="glass-sm" style={{ padding: 0, overflow: "hidden" }}>
              <div className="run-split-row run-split-header">
                <span>Km</span><span>Pace</span><span>Time</span>
              </div>
              {run.splits.map((s) => (
                <div key={s.km} className="run-split-row">
                  <span className="mono" style={{ fontWeight: 600, color: "#FFFFFF" }}>KM {s.km}</span>
                  <span className={`mono ${s.pace < run.avgPace ? "run-split-fast" : "run-split-slow"}`}>{fmtPace(s.pace)} /km</span>
                  <span className="mono" style={{ color: "#A0A0A0" }}>{fmtDuration(Math.round(s.duration))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Route Preview */}
        {run.route && run.route.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <div className="dash-section-title" style={{ fontSize: 13, marginBottom: 10 }}><span className="st-dot" />Route Preview</div>
            <RunMap route={run.route} height={200} showMarker={true} />
          </div>
        )}

        {/* AI Coach Feedback */}
        <div className="dash-ai-card" style={{ marginBottom: 20, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(200,255,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#C8FF00" }}>AI Running Coach</span>
          </div>
          <p style={{ fontSize: 13, color: "#D0D0D0", lineHeight: 1.6, marginBottom: 12 }}>{report.feedback}</p>
          {report.tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
              <span style={{ color: "#C8FF00", fontSize: 12, marginTop: 2 }}>→</span>
              <span style={{ fontSize: 12, color: "#A0A0A0", lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="neon-btn" onClick={handleSave} style={{ padding: "12px 32px" }}>Save Run</button>
          <button className="ghost-btn" onClick={onClose} style={{ padding: "12px 24px" }}>Discard</button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Run History ─────────────────────────────────────────────────────────────
const RunHistory = ({ state, dispatch }) => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [viewRun, setViewRun] = useState(null);

  const runs = useMemo(() => {
    let filtered = (state.runs || []).filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return r.date.includes(q) || fmt2(r.distance, 2).includes(q) || fmtPace(r.avgPace).includes(q);
    });
    filtered.sort((a, b) => {
      const dir = sortDir === "desc" ? -1 : 1;
      if (sortField === "date") return dir * a.date.localeCompare(b.date);
      if (sortField === "distance") return dir * (a.distance - b.distance);
      if (sortField === "duration") return dir * (a.duration - b.duration);
      if (sortField === "pace") return dir * (a.avgPace - b.avgPace);
      return 0;
    });
    return filtered;
  }, [state.runs, search, sortField, sortDir]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this run?")) {
      dispatch({ type: "DELETE_RUN", payload: id });
    }
  };

  if (viewRun) {
    return (
      <div>
        <button className="ghost-btn" onClick={() => setViewRun(null)} style={{ marginBottom: 16 }}>← Back to History</button>
        <RunSummary run={viewRun} state={state} dispatch={dispatch} onClose={() => setViewRun(null)} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="wm-search-bar" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search runs..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        <select value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ width: "auto", minWidth: 140 }}>
          <option value="date">Date</option>
          <option value="distance">Distance</option>
          <option value="duration">Duration</option>
          <option value="pace">Pace</option>
        </select>
        <button className="ghost-btn" onClick={() => setSortDir((d) => d === "desc" ? "asc" : "desc")} style={{ padding: "10px 14px" }}>
          {sortDir === "desc" ? "↓ Desc" : "↑ Asc"}
        </button>
      </div>

      {runs.length === 0 ? (
        <EmptyState icon="🏃" title="No runs yet" desc="Start your first run to see it here!" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {runs.map((run) => (
            <div key={run.id} className="run-history-item" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>{run.date}</span>
                  {run.distance >= 5 && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(200,255,0,0.1)", color: "#C8FF00", fontWeight: 600 }}>{fmt2(run.distance, 1)} km</span>}
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#A0A0A0" }}>
                  <span className="mono">{fmtDuration(run.duration)}</span>
                  <span className="mono">{fmtPace(run.avgPace)} /km</span>
                  <span className="mono">{run.calories} kcal</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="ghost-btn" onClick={() => setViewRun(run)} style={{ padding: "6px 12px", fontSize: 12 }}>View</button>
                <button className="ghost-btn" onClick={() => handleDelete(run.id)} style={{ padding: "6px 12px", fontSize: 12, color: "#FF4757", borderColor: "rgba(255,71,87,0.2)" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 16, fontSize: 12, color: "#A0A0A0", textAlign: "center" }}>
        Showing {runs.length} of {(state.runs || []).length} runs
      </div>
    </div>
  );
};

// ── Personal Records ────────────────────────────────────────────────────────
const PersonalRecords = ({ state }) => {
  const runs = state.runs || [];
  const prs = state.runningPRs || {};

  const records = useMemo(() => {
    if (runs.length === 0) return [];
    const sorted = [...runs];
    const best = [];

    const fastest1km = sorted.filter((r) => r.avgPace > 0).sort((a, b) => a.avgPace - b.avgPace)[0];
    if (fastest1km) best.push({ id: "fastest1km", label: "Fastest 1 km", value: fmtPace(fastest1km.avgPace), unit: "/km", date: fastest1km.date, icon: "⚡" });

    const longest = sorted.sort((a, b) => b.distance - a.distance)[0];
    if (longest) best.push({ id: "longestDistance", label: "Longest Distance", value: fmt2(longest.distance, 2), unit: "km", date: longest.date, icon: "📏" });

    const fastest5k = sorted.filter((r) => r.distance >= 5).sort((a, b) => a.avgPace - b.avgPace)[0];
    if (fastest5k) best.push({ id: "fastest5km", label: "Fastest 5 km", value: fmtPace(fastest5k.avgPace), unit: "/km", date: fastest5k.date, icon: "🏅" });

    const longestDuration = sorted.sort((a, b) => b.duration - a.duration)[0];
    if (longestDuration) best.push({ id: "longestDuration", label: "Longest Duration", value: fmtDurationLong(longestDuration.duration), unit: "", date: longestDuration.date, icon: "⏱️" });

    const highestCal = sorted.sort((a, b) => b.calories - a.calories)[0];
    if (highestCal) best.push({ id: "highestCalories", label: "Highest Calories", value: highestCal.calories, unit: "kcal", date: highestCal.date, icon: "🔥" });

    const totalDist = runs.reduce((s, r) => s + r.distance, 0);
    best.push({ id: "totalDistance", label: "Total Distance", value: fmt2(totalDist, 1), unit: "km", date: "", icon: "🌍" });

    return best;
  }, [runs]);

  const earnedBadgeIds = useMemo(() => {
    const ids = [];
    const totalRuns = runs.length;
    const totalDist = runs.reduce((s, r) => s + r.distance, 0);
    const streak = getRunningStreak(runs);

    if (totalRuns >= 1) ids.push("first_run");
    if (runs.some((r) => r.distance >= 5)) ids.push("run_5k");
    if (runs.some((r) => r.distance >= 10)) ids.push("run_10k");
    if (runs.some((r) => r.distance >= 21.1)) ids.push("half_marathon");
    if (runs.some((r) => r.distance >= 42.195)) ids.push("marathon");
    if (runs.some((r) => r.avgPace > 0 && r.avgPace < 4.5)) ids.push("speed_demon");
    if (streak >= 3) ids.push("streak_3");
    if (streak >= 7) ids.push("streak_7");
    if (totalDist >= 100) ids.push("total_100km");
    if (totalDist >= 500) ids.push("total_500km");
    if (runs.some((r) => { const h = new Date(r.startTime).getHours(); return h < 7; })) ids.push("early_bird");
    if (runs.some((r) => { const h = new Date(r.startTime).getHours(); return h >= 21; })) ids.push("night_runner");
    if (runs.some((r) => r.calories >= 1000)) ids.push("calorie_burner");
    if (totalRuns >= 10) ids.push("ten_runs");
    if (totalRuns >= 50) ids.push("fifty_runs");
    return ids;
  }, [runs]);

  if (runs.length === 0) {
    return <EmptyState icon="🏆" title="No records yet" desc="Complete runs to set personal records!" />;
  }

  return (
    <div>
      {/* Personal Records */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 32 }}>
        {records.map((r) => (
          <div key={r.id} className="run-pr-card achieved">
            <div style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</div>
            <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 4 }}>{r.label}</div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: "#C8FF00" }}>{r.value}<span style={{ fontSize: 12, fontWeight: 400, color: "#A0A0A0", marginLeft: 4 }}>{r.unit}</span></div>
            {r.date && <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 4 }}>{r.date}</div>}
          </div>
        ))}
      </div>

      {/* Badges */}
      <SectionTitle>Achievement Badges</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginTop: 12 }}>
        {RUNNING_BADGE_DEFS.map((b) => (
          <div key={b.id} className={`run-badge-card ${earnedBadgeIds.includes(b.id) ? "earned" : ""}`}>
            <div className="run-badge-icon" style={{ opacity: earnedBadgeIds.includes(b.id) ? 1 : 0.3 }}>{b.icon}</div>
            <div className="run-badge-label">{b.label}</div>
            <div className="run-badge-desc">{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Running Analytics ───────────────────────────────────────────────────────
const RunningAnalytics = ({ state }) => {
  const runs = state.runs || [];
  const [chartPeriod, setChartPeriod] = useState("monthly");

  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      const weekRuns = runs.filter((r) => {
        const d = new Date(r.date);
        return d >= weekStart && d <= weekEnd;
      });
      weeks.push({
        label,
        distance: parseFloat(weekRuns.reduce((s, r) => s + r.distance, 0).toFixed(2)),
        calories: weekRuns.reduce((s, r) => s + r.calories, 0),
        count: weekRuns.length,
      });
    }
    return weeks;
  }, [runs]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en", { month: "short" });
      const monthRuns = runs.filter((r) => {
        const rd = new Date(r.date);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      });
      months.push({
        label,
        distance: parseFloat(monthRuns.reduce((s, r) => s + r.distance, 0).toFixed(2)),
        calories: monthRuns.reduce((s, r) => s + r.calories, 0),
        count: monthRuns.length,
      });
    }
    return months;
  }, [runs]);

  const paceTrend = useMemo(() => {
    return runs.slice(-20).map((r, i) => ({
      label: r.date.slice(5),
      pace: r.avgPace ? parseFloat(fmt2(r.avgPace, 1)) : 0,
      distance: parseFloat(fmt2(r.distance, 1)),
    }));
  }, [runs]);

  const frequencyData = useMemo(() => {
    const now = new Date();
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const label = `W${8 - i}`;
      const count = runs.filter((r) => {
        const d = new Date(r.date);
        return d >= weekStart && d <= weekEnd;
      }).length;
      weeks.push({ label, count });
    }
    return weeks;
  }, [runs]);

  const totalDist = runs.reduce((s, r) => s + r.distance, 0);
  const totalCal = runs.reduce((s, r) => s + r.calories, 0);
  const totalDuration = runs.reduce((s, r) => s + r.duration, 0);

  if (runs.length === 0) {
    return <EmptyState icon="📊" title="No data yet" desc="Complete runs to see your analytics!" />;
  }

  const tooltipStyle = { contentStyle: { background: "#1D1D1D", border: "1px solid rgba(200,255,0,0.15)", borderRadius: 10, fontSize: 12, color: "#FFFFFF" }, labelStyle: { color: "#A0A0A0" } };

  return (
    <div>
      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <RunMetricCard icon="📏" label="Total Distance" value={fmt2(totalDist, 1)} unit="km" color="#C8FF00" />
        <RunMetricCard icon="🔥" label="Total Calories" value={totalCal.toLocaleString()} unit="kcal" color="#FF4757" />
        <RunMetricCard icon="⏱️" label="Total Time" value={fmtDurationLong(totalDuration)} unit="" color="#A0A0A0" />
        <RunMetricCard icon="🏃" label="Total Runs" value={runs.length} unit="" color="#00C853" />
      </div>

      <TabBar
        tabs={[{ id: "weekly", label: "Weekly Distance" }, { id: "monthly", label: "Monthly Distance" }, { id: "calories", label: "Calories" }, { id: "pace", label: "Pace Trend" }, { id: "frequency", label: "Frequency" }]}
        active={chartPeriod}
        onChange={setChartPeriod}
      />

      <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
        {chartPeriod === "weekly" && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,255,0,0.05)" />
              <XAxis dataKey="label" stroke="#A0A0A0" fontSize={11} />
              <YAxis stroke="#A0A0A0" fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="distance" fill="#C8FF00" radius={[6, 6, 0, 0]} name="Distance (km)" />
            </BarChart>
          </ResponsiveContainer>
        )}
        {chartPeriod === "monthly" && (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,255,0,0.05)" />
              <XAxis dataKey="label" stroke="#A0A0A0" fontSize={11} />
              <YAxis stroke="#A0A0A0" fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="distance" stroke="#C8FF00" fill="rgba(200,255,0,0.1)" name="Distance (km)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
        {chartPeriod === "calories" && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartPeriod === "monthly" ? monthlyData : weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,255,0,0.05)" />
              <XAxis dataKey="label" stroke="#A0A0A0" fontSize={11} />
              <YAxis stroke="#A0A0A0" fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="calories" fill="#FF4757" radius={[6, 6, 0, 0]} name="Calories" />
            </BarChart>
          </ResponsiveContainer>
        )}
        {chartPeriod === "pace" && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={paceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,255,0,0.05)" />
              <XAxis dataKey="label" stroke="#A0A0A0" fontSize={11} />
              <YAxis stroke="#A0A0A0" fontSize={11} reversed domain={["auto", "auto"]} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="pace" stroke="#C8FF00" strokeWidth={2} dot={{ fill: "#C8FF00", r: 3 }} name="Pace (min/km)" />
            </LineChart>
          </ResponsiveContainer>
        )}
        {chartPeriod === "frequency" && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,255,0,0.05)" />
              <XAxis dataKey="label" stroke="#A0A0A0" fontSize={11} />
              <YAxis stroke="#A0A0A0" fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="#00C853" radius={[6, 6, 0, 0]} name="Runs" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Personal Best Timeline */}
      <SectionTitle>Personal Best Timeline</SectionTitle>
      <div className="glass" style={{ padding: 20, marginTop: 12 }}>
        {runs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {runs.slice(-10).map((r, i) => {
              const isBest = i === 0 || r.avgPace < runs.slice(0, i).reduce((min, pr) => Math.min(min, pr.avgPace), Infinity);
              return (
                <div key={r.id} className="dash-timeline-item">
                  <div className="dash-timeline-dot" style={{ background: isBest ? "#FFD700" : "#C8FF00" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{r.date}</div>
                    <div style={{ fontSize: 12, color: "#A0A0A0" }}>{fmt2(r.distance, 2)} km · {fmtPace(r.avgPace)} /km · {fmtDuration(r.duration)}</div>
                  </div>
                  {isBest && <span className="run-pr-badge">PR</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#A0A0A0", textAlign: "center", padding: 20 }}>No runs to display</div>
        )}
      </div>
    </div>
  );
};

// ── AI Running Coach ────────────────────────────────────────────────────────
const AICoach = ({ state }) => {
  const runs = state.runs || [];
  const [tipIndex, setTipIndex] = useState(0);

  const insights = useMemo(() => {
    if (runs.length === 0) return { tips: ["Start your first run to get personalized coaching!"], stats: null };
    const recent = runs.slice(-5);
    const avgPace = recent.reduce((s, r) => s + r.avgPace, 0) / recent.length;
    const avgDist = recent.reduce((s, r) => s + r.distance, 0) / recent.length;
    const totalDist = runs.reduce((s, r) => s + r.distance, 0);
    const streak = getRunningStreak(runs);

    const tips = [];
    if (recent.length >= 2) {
      const paceTrend = recent[recent.length - 1].avgPace - recent[0].avgPace;
      if (paceTrend < -0.1) tips.push(`Your pace has been improving! You've gotten ${Math.round(Math.abs(paceTrend) * 60)}s/km faster over your last ${recent.length} runs.`);
      else if (paceTrend > 0.1) tips.push(`You slowed down by ${Math.round(paceTrend * 60)}s/km over your last runs. Consider incorporating tempo runs.`);
    }

    if (avgDist < 3) tips.push("Try gradually increasing your distance by 10% per week. Small increments prevent injury.");
    if (avgPace > 7) tips.push("Try run/walk intervals: run 3 minutes, walk 1 minute. Gradually increase the run intervals.");
    if (avgPace < 5 && avgDist > 5) tips.push("You're running at a solid pace! Consider training for a half marathon.");
    if (streak >= 5) tips.push(`Amazing ${streak}-day streak! Remember to include easy/recovery days.`);
    if (streak === 0 && runs.length > 0) tips.push("You haven't run in a few days. A short easy run can help maintain your fitness.");

    tips.push(pick(MOCK_RUN_COACHING.tips));
    tips.push(pick(MOCK_RUN_COACHING.tips));

    return {
      tips: tips.slice(0, 4),
      stats: {
        avgPace,
        avgDist,
        totalDist,
        streak,
        totalRuns: runs.length,
        bestPace: Math.min(...runs.filter((r) => r.avgPace > 0).map((r) => r.avgPace)),
        longestRun: Math.max(...runs.map((r) => r.distance)),
      },
    };
  }, [runs]);

  const trainingPlan = useMemo(() => {
    if (runs.length < 3) return null;
    const streak = getRunningStreak(runs);
    const avgDist = runs.slice(-5).reduce((s, r) => s + r.distance, 0) / Math.min(5, runs.length);
    return [
      { day: "Mon", type: "Easy Run", distance: `${fmt2(avgDist * 0.7, 1)} km`, note: "Conversational pace" },
      { day: "Tue", type: "Rest", distance: "—", note: "Recovery day" },
      { day: "Wed", type: "Tempo Run", distance: `${fmt2(avgDist * 0.8, 1)} km`, note: "Comfortably hard pace" },
      { day: "Thu", type: "Rest", distance: "—", note: "Stretch & foam roll" },
      { day: "Fri", type: "Easy Run", distance: `${fmt2(avgDist * 0.6, 1)} km`, note: "Short & easy" },
      { day: "Sat", type: "Long Run", distance: `${fmt2(avgDist * 1.3, 1)} km`, note: "Slow and steady" },
      { day: "Sun", type: "Rest", distance: "—", note: "Full rest" },
    ];
  }, [runs]);

  return (
    <div>
      {/* Quick Stats */}
      {insights.stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
          <RunMetricCard icon="🏃" label="Total Runs" value={insights.stats.totalRuns} unit="" />
          <RunMetricCard icon="📏" label="Avg Distance" value={fmt2(insights.stats.avgDist, 1)} unit="km" />
          <RunMetricCard icon="⚡" label="Best Pace" value={fmtPace(insights.stats.bestPace)} unit="/km" color="#00C853" />
          <RunMetricCard icon="🔥" label="Streak" value={insights.stats.streak} unit="days" color="#FFA500" />
        </div>
      )}

      {/* AI Insights */}
      <SectionTitle>AI Coaching Insights</SectionTitle>
      <div className="dash-ai-card" style={{ marginTop: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(200,255,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#C8FF00" }}>Running Coach</div>
            <div style={{ fontSize: 11, color: "#A0A0A0" }}>Personalized recommendations based on your data</div>
          </div>
        </div>
        {insights.tips.map((tip, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
            <span style={{ color: "#C8FF00", fontSize: 16, lineHeight: 1.3 }}>→</span>
            <span style={{ fontSize: 13, color: "#D0D0D0", lineHeight: 1.6 }}>{tip}</span>
          </div>
        ))}
      </div>

      {/* Suggested Training Plan */}
      {trainingPlan && (
        <>
          <SectionTitle>Suggested Weekly Plan</SectionTitle>
          <div className="glass" style={{ padding: 0, overflow: "hidden", marginTop: 12 }}>
            {trainingPlan.map((day, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px", gap: 12, padding: "12px 16px", borderBottom: i < trainingPlan.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "#C8FF00" }}>{day.day}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{day.type}</div>
                  <div style={{ fontSize: 11, color: "#A0A0A0" }}>{day.note}</div>
                </div>
                <span className="mono" style={{ fontSize: 13, color: "#A0A0A0", textAlign: "right" }}>{day.distance}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Hydration Reminder */}
      <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "rgba(0,188,212,0.06)", border: "1px solid rgba(0,188,212,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>💧</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#00BCD4" }}>Hydration Tip</div>
            <div style={{ fontSize: 12, color: "#A0A0A0" }}>Drink 500ml of water 2 hours before your next run. Dehydration can reduce performance by up to 15%.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Running Goals ───────────────────────────────────────────────────────────
const RunningGoals = ({ state, dispatch }) => {
  const runs = state.runs || [];
  const goals = state.runningGoals || { dailyKm: 5, weeklyKm: 25, monthlyKm: 100, calories: 500, streakTarget: 7 };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...goals });

  const todayStr = today();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const todayRuns = runs.filter((r) => r.date === todayStr);
  const weekRuns = runs.filter((r) => new Date(r.date) >= weekStart);
  const monthRuns = runs.filter((r) => new Date(r.date) >= monthStart);

  const todayDist = todayRuns.reduce((s, r) => s + r.distance, 0);
  const weekDist = weekRuns.reduce((s, r) => s + r.distance, 0);
  const monthDist = monthRuns.reduce((s, r) => s + r.distance, 0);
  const todayCal = todayRuns.reduce((s, r) => s + r.calories, 0);
  const streak = getRunningStreak(runs);

  const goalItems = [
    { label: "Daily Distance", current: todayDist, target: goals.dailyKm, unit: "km", icon: "📏", color: "#C8FF00" },
    { label: "Weekly Distance", current: weekDist, target: goals.weeklyKm, unit: "km", icon: "📅", color: "#00C853" },
    { label: "Monthly Distance", current: monthDist, target: goals.monthlyKm, unit: "km", icon: "📆", color: "#00BCD4" },
    { label: "Calories Goal", current: todayCal, target: goals.calories, unit: "kcal", icon: "🔥", color: "#FF4757" },
    { label: "Run Streak", current: streak, target: goals.streakTarget, unit: "days", icon: "🔥", color: "#FFA500" },
  ];

  const handleSave = () => {
    dispatch({ type: "SET_RUNNING_GOALS", payload: form });
    setEditing(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        {!editing ? (
          <button className="ghost-btn" onClick={() => setEditing(true)}>Edit Goals</button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ghost-btn" onClick={() => setEditing(false)}>Cancel</button>
            <button className="neon-btn" onClick={handleSave} style={{ padding: "8px 18px" }}>Save</button>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {goalItems.map((g) => {
          const pct = Math.min(100, (g.current / (g.target || 1)) * 100);
          const met = pct >= 100;
          return (
            <div key={g.label} className={`run-goal-card ${met ? "met" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{g.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{g.label}</div>
                </div>
                {met && <span style={{ fontSize: 16 }}>✅</span>}
              </div>
              {editing ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#A0A0A0" }}>Target:</span>
                  <input
                    type="number"
                    value={form[g.label === "Daily Distance" ? "dailyKm" : g.label === "Weekly Distance" ? "weeklyKm" : g.label === "Monthly Distance" ? "monthlyKm" : g.label === "Calories Goal" ? "calories" : "streakTarget"]}
                    onChange={(e) => setForm((f) => ({ ...f, [g.label === "Daily Distance" ? "dailyKm" : g.label === "Weekly Distance" ? "weeklyKm" : g.label === "Monthly Distance" ? "monthlyKm" : g.label === "Calories Goal" ? "calories" : "streakTarget"]: Number(e.target.value) }))}
                    style={{ width: 80, padding: "4px 8px", fontSize: 13, height: 32 }}
                  />
                  <span style={{ fontSize: 12, color: "#A0A0A0" }}>{g.unit}</span>
                </div>
              ) : null}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: g.color }}>{fmt2(g.current, 1)} <span style={{ fontSize: 11, fontWeight: 400, color: "#A0A0A0" }}>{g.unit}</span></span>
                <span className="mono" style={{ fontSize: 12, color: "#A0A0A0" }}>{fmt2(pct, 0)}%</span>
              </div>
              <div className="dash-progress">
                <div className="dash-progress-fill" style={{ width: `${pct}%`, background: met ? "#00C853" : g.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Running Dashboard (Main View) ───────────────────────────────────────────
const RunningDashboard = ({ state, dispatch, onStartRun }) => {
  const runs = state.runs || [];
  const goals = state.runningGoals || { dailyKm: 5, weeklyKm: 25, monthlyKm: 100, calories: 500, streakTarget: 7 };
  const todayStr = today();
  const todayRuns = runs.filter((r) => r.date === todayStr);
  const todayDist = todayRuns.reduce((s, r) => s + r.distance, 0);
  const todayCal = todayRuns.reduce((s, r) => s + r.calories, 0);
  const totalDist = runs.reduce((s, r) => s + r.distance, 0);
  const streak = getRunningStreak(runs);
  const recentRuns = runs.slice(-5).reverse();
  const lastRun = runs.length > 0 ? runs[runs.length - 1] : null;

  return (
    <div>
      {/* Header */}
      <div className="dash-header" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🏃</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF" }}>Running Mode</h1>
            <p style={{ fontSize: 13, color: "#A0A0A0", marginTop: 2 }}>Track your runs, crush your goals</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        <div className="dash-quick" onClick={onStartRun}>
          <div className="q-icon" style={{ background: "rgba(200,255,0,0.1)" }}>▶️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Start Run</div>
            <div style={{ fontSize: 11, color: "#A0A0A0" }}>Begin tracking</div>
          </div>
        </div>
        {lastRun && (
          <div className="dash-quick">
            <div className="q-icon" style={{ background: "rgba(0,200,83,0.1)" }}>📊</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Last Run</div>
              <div style={{ fontSize: 11, color: "#A0A0A0" }}>{fmt2(lastRun.distance, 1)} km · {fmtPace(lastRun.avgPace)} /km</div>
            </div>
          </div>
        )}
        <div className="dash-quick">
          <div className="q-icon" style={{ background: "rgba(255,165,0,0.1)" }}>🔥</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Streak</div>
            <div style={{ fontSize: 11, color: "#A0A0A0" }}>{streak} day{streak !== 1 ? "s" : ""} running</div>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <SectionTitle>Today's Activity</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginTop: 12, marginBottom: 24 }}>
        <RunMetricCard icon="📏" label="Distance" value={fmt2(todayDist, 2)} unit="km" color="#C8FF00" />
        <RunMetricCard icon="🔥" label="Calories" value={todayCal} unit="kcal" color="#FF4757" />
        <RunMetricCard icon="🏃" label="Runs Today" value={todayRuns.length} unit="" color="#00C853" />
        <RunMetricCard icon="🌍" label="Total Distance" value={fmt2(totalDist, 1)} unit="km" color="#A0A0A0" />
      </div>

      {/* Goal Progress */}
      <SectionTitle>Goal Progress</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 12, marginBottom: 24 }}>
        {[
          { label: "Daily", current: todayDist, target: goals.dailyKm, color: "#C8FF00" },
          { label: "Weekly", current: (() => { const ws = new Date(); ws.setDate(ws.getDate() - ws.getDay()); return runs.filter((r) => new Date(r.date) >= ws).reduce((s, r) => s + r.distance, 0); })(), target: goals.weeklyKm, color: "#00C853" },
          { label: "Monthly", current: (() => { const ms = new Date(new Date().getFullYear(), new Date().getMonth(), 1); return runs.filter((r) => new Date(r.date) >= ms).reduce((s, r) => s + r.distance, 0); })(), target: goals.monthlyKm, color: "#00BCD4" },
        ].map((g) => {
          const pct = Math.min(100, (g.current / (g.target || 1)) * 100);
          return (
            <div key={g.label} className="glass-sm" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{g.label} Goal</span>
                <span className="mono" style={{ fontSize: 12, color: "#A0A0A0" }}>{fmt2(pct, 0)}%</span>
              </div>
              <div className="dash-progress" style={{ marginBottom: 6 }}>
                <div className="dash-progress-fill" style={{ width: `${pct}%`, background: pct >= 100 ? "#00C853" : g.color }} />
              </div>
              <div style={{ fontSize: 12, color: "#A0A0A0" }}>
                <span className="mono" style={{ color: g.color, fontWeight: 600 }}>{fmt2(g.current, 1)}</span> / {fmt2(g.target, 0)} km
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Preview */}
      <SectionTitle>Route Map</SectionTitle>
      <div style={{ marginTop: 12, marginBottom: 24 }}>
        <RunMap route={lastRun?.route || []} height={250} />
      </div>

      {/* Recent Runs */}
      <SectionTitle>Recent Runs</SectionTitle>
      <div style={{ marginTop: 12 }}>
        {recentRuns.length === 0 ? (
          <EmptyState icon="🏃" title="No runs yet" desc="Start your first run to begin tracking!" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentRuns.map((run) => (
              <div key={run.id} className="run-history-item" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(200,255,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏃</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>{run.date}</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#A0A0A0", marginTop: 2 }}>
                    <span className="mono">{fmt2(run.distance, 2)} km</span>
                    <span className="mono">{fmtPace(run.avgPace)} /km</span>
                    <span className="mono">{fmtDuration(run.duration)}</span>
                    <span className="mono">{run.calories} kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Running Notifications ───────────────────────────────────────────────────
const RunningNotifications = ({ notifications, onClear }) => {
  if (!notifications || notifications.length === 0) return null;
  return (
    <div style={{ position: "fixed", top: 80, right: 24, zIndex: 9998, display: "flex", flexDirection: "column", gap: 8, maxWidth: 340 }}>
      {notifications.map((n) => (
        <motion.div key={n.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
          style={{ background: "#151515", border: "1px solid rgba(200,255,0,0.15)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <span style={{ fontSize: 18 }}>{n.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{n.title}</div>
            <div style={{ fontSize: 11, color: "#A0A0A0" }}>{n.message}</div>
          </div>
          <button onClick={() => onClear(n.id)} style={{ background: "none", border: "none", color: "#A0A0A0", fontSize: 14, cursor: "pointer", padding: 4 }}>✕</button>
        </motion.div>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ── Main RunningMode Component ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function RunningMode({ state, dispatch }) {
  const [mode, setMode] = useState("dashboard");
  const [subTab, setSubTab] = useState("overview");
  const [summaryRun, setSummaryRun] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const runs = state.runs || [];

  const addNotification = useCallback((icon, title, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, icon, title, message }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleRunSummary = useCallback((run) => {
    setSummaryRun(run);
    setMode("dashboard");
    setSubTab("overview");

    // Check for PRs and badges
    const prevRuns = runs;
    const newBadges = [];
    const totalRuns = prevRuns.length + 1;
    const totalDist = prevRuns.reduce((s, r) => s + r.distance, 0) + run.distance;

    if (totalRuns === 1) newBadges.push("first_run");
    if (run.distance >= 5) newBadges.push("run_5k");
    if (run.distance >= 10) newBadges.push("run_10k");
    if (run.distance >= 21.1) newBadges.push("half_marathon");
    if (run.distance >= 42.195) newBadges.push("marathon");
    if (run.avgPace > 0 && run.avgPace < 4.5) newBadges.push("speed_demon");
    if (totalDist >= 100) newBadges.push("total_100km");
    if (totalDist >= 500) newBadges.push("total_500km");
    if (run.calories >= 1000) newBadges.push("calorie_burner");
    if (totalRuns >= 10) newBadges.push("ten_runs");
    if (totalRuns >= 50) newBadges.push("fifty_runs");

    const hour = new Date().getHours();
    if (hour < 7) newBadges.push("early_bird");
    if (hour >= 21) newBadges.push("night_runner");

    const streak = getRunningStreak([...prevRuns, { date: run.date }]);
    if (streak >= 3) newBadges.push("streak_3");
    if (streak >= 7) newBadges.push("streak_7");

    newBadges.forEach((b) => {
      const badgeDef = RUNNING_BADGE_DEFS.find((d) => d.id === b);
      if (badgeDef) addNotification(badgeDef.icon, "Badge Earned!", badgeDef.label);
    });

    // Check PRs
    if (prevRuns.length > 0) {
      const bestPace = Math.min(...prevRuns.filter((r) => r.avgPace > 0).map((r) => r.avgPace));
      if (run.avgPace > 0 && run.avgPace < bestPace) {
        addNotification("⚡", "New Personal Record!", "Fastest pace ever!");
      }
      const bestDist = Math.max(...prevRuns.map((r) => r.distance));
      if (run.distance > bestDist) {
        addNotification("📏", "New Personal Record!", "Longest distance!");
      }
    }

    // Goal notifications
    const goals = state.runningGoals || { dailyKm: 5, weeklyKm: 25 };
    const todayDist = [...prevRuns, { date: run.date, distance: run.distance }]
      .filter((r) => r.date === run.date)
      .reduce((s, r) => s + (r.distance || 0), 0);
    if (todayDist >= goals.dailyKm) {
      addNotification("🎯", "Goal Achieved!", "Daily distance goal reached!");
    }
  }, [runs, state.runningGoals, addNotification]);

  const handleSaveRun = useCallback((run) => {
    dispatch({ type: "SAVE_RUN", payload: run });
    setSummaryRun(null);
  }, [dispatch]);

  const handleStartRun = useCallback(() => {
    setMode("active");
  }, []);

  const renderContent = () => {
    if (mode === "active") {
      return (
        <ActiveRun
          state={state}
          dispatch={dispatch}
          onSummary={(run) => { handleRunSummary(run); }}
          onCancel={() => setMode("dashboard")}
        />
      );
    }

    if (subTab === "overview") {
      return <RunningDashboard state={state} dispatch={dispatch} onStartRun={handleStartRun} />;
    }
    if (subTab === "history") {
      return <RunHistory state={state} dispatch={dispatch} />;
    }
    if (subTab === "records") {
      return <PersonalRecords state={state} />;
    }
    if (subTab === "analytics") {
      return <RunningAnalytics state={state} />;
    }
    if (subTab === "goals") {
      return <RunningGoals state={state} dispatch={dispatch} />;
    }
    if (subTab === "coach") {
      return <AICoach state={state} />;
    }

    return <RunningDashboard state={state} dispatch={dispatch} onStartRun={handleStartRun} />;
  };

  return (
    <>
      <style>{RUNNING_STYLES}</style>
      <RunningNotifications notifications={notifications} onClear={clearNotification} />

      <AnimatePresence>
        {summaryRun && (
          <RunSummary run={summaryRun} state={state} dispatch={dispatch} onClose={() => { setSummaryRun(null); }} />
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      {mode !== "active" && (
        <TabBar
          tabs={[
            { id: "overview", icon: "🏠", label: "Overview" },
            { id: "history", icon: "📋", label: "History" },
            { id: "records", icon: "🏆", label: "Records" },
            { id: "analytics", icon: "📊", label: "Analytics" },
            { id: "goals", icon: "🎯", label: "Goals" },
            { id: "coach", icon: "🤖", label: "Coach" },
          ]}
          active={subTab}
          onChange={setSubTab}
        />
      )}

      <motion.div
        key={mode === "active" ? "active" : subTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </>
  );
}
