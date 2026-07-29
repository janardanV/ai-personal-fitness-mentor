import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt, today, COLORS, useAICoach, usdaDebouncedSearch, showToast, showConfirm } from "../utils/helpers";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const StatCard = ({ label, value, unit, color = COLORS.primary, sub }) => (
  <div style={{ background: "#151515", border: `1px solid ${color}18`, borderRadius: 16, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(${color}20, transparent)`, borderRadius: "0 0 0 100%" }} />
    <div style={{ fontSize: 11, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>{value}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, color: "#A0A0A0" }}>{unit}</span></div>
    {sub && <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 4 }}>{sub}</div>}
  </div>
);

const Card = ({ children, style, className = "" }) => (
  <div className={`glass ${className}`} style={{ padding: "20px", ...style }}>{children}</div>
);

const ProgressRing = ({ value, max, size = 80, color = COLORS.primary, label }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / max) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={13} fontWeight={700} fontFamily="'JetBrains Mono',monospace">{fmt(value)}</text>
      </svg>
      <span style={{ fontSize: 11, color: "#A0A0A0" }}>{label}</span>
    </div>
  );
};

const Nutrition = ({ state, dispatch }) => {
  const { profile, nutrition, water } = state;
  const { ask, loading: aiLoading } = useAICoach();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingQty, setServingQty] = useState(100);
  const [mealType, setMealType] = useState("Lunch");
  const [showDropdown, setShowDropdown] = useState(false);
  const [aiRec, setAiRec] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editMealType, setEditMealType] = useState("");
  const [editServing, setEditServing] = useState(0);
  const [waterIntake, setWaterIntake] = useState(() => (water || {})[today()] || 0);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const todayStr = today();

  useEffect(() => { setWaterIntake((water || {})[todayStr] || 0); }, [water, todayStr]);
  const todayLog = useMemo(() => nutrition.filter(n => n.date === todayStr), [nutrition, todayStr]);

  const totals = useMemo(() => todayLog.reduce((acc, n) => ({
    calories: acc.calories + (n.calories || 0),
    protein: acc.protein + (n.protein || 0),
    carbs: acc.carbs + (n.carbs || 0),
    fat: acc.fat + (n.fat || 0),
    fiber: acc.fiber + (n.fiber || 0),
    sugar: acc.sugar + (n.sugar || 0),
    sodium: acc.sodium + (n.sodium || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }), [todayLog]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !searchRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (val) => {
    setSearchQuery(val);
    setShowDropdown(true);
    usdaDebouncedSearch(val, (results, loading, error) => {
      setSearchResults(results);
      setSearchLoading(loading);
      setSearchError(error);
    });
  };

  const selectFood = (food) => {
    setSelectedFood(food);
    setServingQty(food.servingSize || 100);
    setSearchQuery(food.name);
    setShowDropdown(false);
  };

  const calcScaled = (val, qty, baseSize) => {
    if (!baseSize || !val) return 0;
    return Math.round((val / baseSize) * qty * 100) / 100;
  };

  const logFood = () => {
    if (!selectedFood) return;
    const qty = servingQty;
    const base = selectedFood.servingSize || 100;
    const entry = {
      id: Date.now(), date: todayStr, fdcId: selectedFood.fdcId, food: selectedFood.name,
      brand: selectedFood.brand || "", meal: mealType, servingQty: qty, servingUnit: selectedFood.servingUnit || "g",
      calories: Math.round(calcScaled(selectedFood.calories, qty, base)),
      protein: Math.round(calcScaled(selectedFood.protein, qty, base) * 10) / 10,
      carbs: Math.round(calcScaled(selectedFood.carbs, qty, base) * 10) / 10,
      fat: Math.round(calcScaled(selectedFood.fat, qty, base) * 10) / 10,
      saturatedFat: Math.round(calcScaled(selectedFood.saturatedFat, qty, base) * 10) / 10,
      fiber: Math.round(calcScaled(selectedFood.fiber, qty, base) * 10) / 10,
      sugar: Math.round(calcScaled(selectedFood.sugar, qty, base) * 10) / 10,
      sodium: Math.round(calcScaled(selectedFood.sodium, qty, base)),
      potassium: Math.round(calcScaled(selectedFood.potassium, qty, base)),
      cholesterol: Math.round(calcScaled(selectedFood.cholesterol, qty, base)),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    dispatch({ type: "ADD_NUTRITION", payload: entry });
    setSelectedFood(null);
    setSearchQuery("");
    setServingQty(100);
    showToast(`${selectedFood.name} logged!`);
  };

  const deleteFood = async (id) => {
    const ok = await showConfirm("Delete this food entry?");
    if (ok) { dispatch({ type: "DELETE_NUTRITION", payload: id }); showToast("Entry deleted."); }
  };

  const duplicateFood = (entry) => {
    dispatch({ type: "DUPLICATE_NUTRITION", payload: { ...entry, id: undefined } });
  };

  const saveEdit = () => {
    if (!editingId) return;
    dispatch({ type: "EDIT_NUTRITION", payload: { id: editingId, meal: editMealType, servingQty: editServing } });
    setEditingId(null);
  };

  const changeWater = (amt) => {
    const next = Math.max(0, waterIntake + amt);
    setWaterIntake(next);
    dispatch({ type: "LOG_WATER", payload: { date: todayStr, amount: amt } });
  };

  const getNutritionAdvice = async () => {
    const advice = await ask(
      "You are a sports nutritionist. Give practical, specific meal advice. Max 100 words.",
      `Goal: ${profile.goal}, Target: ${profile.calories} cal / ${profile.protein}g protein. Today eaten: ${totals.calories} cal, ${totals.protein}g protein, ${totals.carbs}g carbs, ${totals.fat}g fat, ${totals.fiber}g fiber, ${totals.sugar}g sugar, ${totals.sodium}mg sodium. Water: ${waterIntake}ml. What should I eat for the rest of today?`
    );
    if (advice) setAiRec(advice);
  };

  const weekData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const dayLogs = nutrition.filter(n => n.date === ds);
      const cal = dayLogs.reduce((s, n) => s + (n.calories || 0), 0);
      const prot = dayLogs.reduce((s, n) => s + (n.protein || 0), 0);
      days.push({ day: d.toLocaleDateString("en", { weekday: "short" }), calories: Math.round(cal), protein: Math.round(prot) });
    }
    return days;
  }, [nutrition]);

  const macroPieData = useMemo(() => [
    { name: "Protein", value: totals.protein * 4, color: COLORS.primary },
    { name: "Carbs", value: totals.carbs * 4, color: COLORS.cyan },
    { name: "Fat", value: totals.fat * 9, color: COLORS.amber },
  ], [totals]);

  const macroData = useMemo(() => [
    { name: "Protein", value: totals.protein, target: profile.protein, color: COLORS.primary },
    { name: "Carbs", value: totals.carbs, target: Math.round((profile.calories * 0.45) / 4), color: COLORS.cyan },
    { name: "Fat", value: totals.fat, target: Math.round((profile.calories * 0.25) / 9), color: COLORS.amber },
  ], [totals, profile]);

  const scaledPreview = useMemo(() => {
    if (!selectedFood) return null;
    const base = selectedFood.servingSize || 100;
    const q = servingQty;
    return {
      calories: Math.round(calcScaled(selectedFood.calories, q, base)),
      protein: Math.round(calcScaled(selectedFood.protein, q, base) * 10) / 10,
      carbs: Math.round(calcScaled(selectedFood.carbs, q, base) * 10) / 10,
      fat: Math.round(calcScaled(selectedFood.fat, q, base) * 10) / 10,
      saturatedFat: Math.round(calcScaled(selectedFood.saturatedFat, q, base) * 10) / 10,
      fiber: Math.round(calcScaled(selectedFood.fiber, q, base) * 10) / 10,
      sugar: Math.round(calcScaled(selectedFood.sugar, q, base) * 10) / 10,
      sodium: Math.round(calcScaled(selectedFood.sodium, q, base)),
      potassium: Math.round(calcScaled(selectedFood.potassium, q, base)),
      cholesterol: Math.round(calcScaled(selectedFood.cholesterol, q, base)),
    };
  }, [selectedFood, servingQty]);

  const servingOptions = useMemo(() => {
    if (!selectedFood) return [];
    const unit = selectedFood.servingUnit || "g";
    const base = selectedFood.servingSize || 100;
    if (unit === "g") return [50, 100, 150, 200, 250, 300, 400, 500].map(v => ({ label: `${v} g`, value: v }));
    if (unit === "ml") return [100, 150, 200, 250, 330, 500].map(v => ({ label: `${v} ml`, value: v }));
    const opts = [];
    for (let i = 1; i <= 4; i++) opts.push({ label: `${i} ${unit}${i > 1 ? "s" : ""}`, value: base * i });
    return opts;
  }, [selectedFood]);

  const inputStyle = { fontSize: 12, padding: "6px 8px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Nutrition Tracker</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Calories" value={totals.calories} unit={`/ ${profile.calories}`} color={totals.calories > profile.calories ? COLORS.red : COLORS.green} sub={`${Math.max(0, profile.calories - totals.calories)} remaining`} />
        {macroData.map(m => <StatCard key={m.name} label={m.name} value={totals[m.name.toLowerCase()]} unit={`g / ${m.target}g`} color={m.color} sub={`${Math.max(0, Math.round(m.target - m.value))}g left`} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Fiber" value={totals.fiber} unit="g" color={COLORS.green} sub="Target: 30g" />
        <StatCard label="Sugar" value={totals.sugar} unit="g" color={COLORS.amber} sub="Limit: 50g" />
        <StatCard label="Sodium" value={totals.sodium} unit="mg" color={totals.sodium > 2300 ? COLORS.red : COLORS.green} sub="Limit: 2300mg" />
        <StatCard label="Water" value={waterIntake} unit="ml" color={COLORS.cyan} sub="Target: 3000ml" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Weekly Calories</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 }} />
              <Bar dataKey="calories" fill="#22C55E" radius={[4, 4, 0, 0]} name="Calories" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Weekly Protein</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 }} />
              <Bar dataKey="protein" fill="#22C55E" radius={[4, 4, 0, 0]} name="Protein (g)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Macro Distribution</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {totals.calories > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={macroPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                      {macroPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {macroPieData.map(m => (
                    <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.color }} />
                      <span style={{ color: "#A0A0A0" }}>{m.name}</span>
                      <span style={{ fontWeight: 600 }}>{m.value} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: "#A0A0A0", fontSize: 13, padding: 20 }}>No food logged today</p>
            )}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Water Intake</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <ProgressRing value={Math.min(waterIntake, 3000)} max={3000} size={100} color={COLORS.cyan} label={`${waterIntake} ml`} />
            <div style={{ display: "flex", gap: 8 }}>
              {[-250, -100, 100, 250, 500].map(amt => (
                <button key={amt} className="ghost-btn" onClick={() => changeWater(amt)} style={{ fontSize: 11, padding: "5px 10px" }}>{amt > 0 ? "+" : ""}{amt}ml</button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Macro Progress</div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {macroData.map(m => <ProgressRing key={m.name} value={Math.min(m.value, m.target)} max={m.target} size={90} color={m.color} label={m.name} />)}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Log Food from USDA Database</div>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <div ref={searchRef} style={{ position: "relative" }}>
            <input
              value={searchQuery}
              onChange={e => { handleSearch(e.target.value); setSelectedFood(null); }}
              onFocus={() => { if (searchResults.length > 0 || searchLoading) setShowDropdown(true); }}
              placeholder="Search foods (e.g., chicken breast, rice, banana)..."
              style={{ fontSize: 14, padding: "10px 14px" }}
            />
            {searchLoading && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#A0A0A0" }}>Searching...</div>}
          </div>
          {showDropdown && !selectedFood && (
            <div ref={dropdownRef} style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, maxHeight: 280, overflowY: "auto", marginTop: 4 }}>
              {searchError && (
                <div style={{ padding: 14, textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: COLORS.red, marginBottom: 8 }}>API Error: {searchError}</p>
                  <button className="ghost-btn" onClick={() => handleSearch(searchQuery)} style={{ fontSize: 12 }}>Retry</button>
                </div>
              )}
              {!searchLoading && !searchError && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div style={{ padding: 14, textAlign: "center", color: "#A0A0A0", fontSize: 13 }}>No foods found for "{searchQuery}"</div>
              )}
              {searchResults.map((food, i) => (
                <div key={i} onClick={() => selectFood(food)} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{food.name}</div>
                  <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 2 }}>
                    {food.brand && <span>{food.brand} · </span>}
                    {food.calories} kcal · P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g per {food.servingSize}{food.servingUnit}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedFood && scaledPreview && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedFood.name}</div>
                {selectedFood.brand && <div style={{ fontSize: 12, color: "#A0A0A0" }}>{selectedFood.brand}</div>}
              </div>
              <button onClick={() => { setSelectedFood(null); setSearchQuery(""); }} style={{ background: "none", color: "#EF4444", fontSize: 16, cursor: "pointer", border: "none" }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#A0A0A0" }}>Serving:</span>
              <input type="number" value={servingQty} onChange={e => setServingQty(Math.max(1, +e.target.value))} style={{ width: 70, fontSize: 12, padding: "4px 8px", textAlign: "center" }} />
              <span style={{ fontSize: 12, color: "#A0A0A0" }}>{selectedFood.servingUnit || "g"}</span>
              {servingOptions.length > 0 && servingOptions.slice(0, 4).map(opt => (
                <button key={opt.value} onClick={() => setServingQty(opt.value)} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: servingQty === opt.value ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.05)", border: `1px solid ${servingQty === opt.value ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)"}`, color: servingQty === opt.value ? "#22C55E" : "#A0A0A0", cursor: "pointer" }}>{opt.label}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
              {[["Calories", scaledPreview.calories, "kcal"], ["Protein", scaledPreview.protein, "g"], ["Carbs", scaledPreview.carbs, "g"], ["Fat", scaledPreview.fat, "g"], ["Sat. Fat", scaledPreview.saturatedFat, "g"], ["Fiber", scaledPreview.fiber, "g"], ["Sugar", scaledPreview.sugar, "g"], ["Sodium", scaledPreview.sodium, "mg"], ["Potassium", scaledPreview.potassium, "mg"], ["Cholesterol", scaledPreview.cholesterol, "mg"]].map(([label, val, unit]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#A0A0A0" }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{val}<span style={{ fontSize: 10, fontWeight: 400, color: "#A0A0A0" }}>{unit}</span></div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#A0A0A0" }}>Meal:</span>
              {MEAL_TYPES.map(m => (
                <button key={m} onClick={() => setMealType(m)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, background: mealType === m ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)", border: `1px solid ${mealType === m ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)"}`, color: mealType === m ? "#22C55E" : "#A0A0A0", cursor: "pointer" }}>{m}</button>
              ))}
              <div style={{ flex: 1 }} />
              <button className="neon-btn" onClick={logFood} style={{ fontSize: 13 }}>Log Food Entry</button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Today's Food Log</div>
        {todayLog.length === 0 ? (
          <p style={{ color: "#A0A0A0", fontSize: 13 }}>No food logged yet today. Search for a food above to get started.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: "#A0A0A0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Food", "Meal", "Serving", "Calories", "Protein", "Carbs", "Fat", "Time", ""].map(h => <th key={h} style={{ padding: "8px 6px", textAlign: "left", fontWeight: 500 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {todayLog.map((n) => (
                  <tr key={n.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "8px 6px" }}>
                      <div style={{ fontWeight: 500 }}>{n.food}</div>
                      {n.brand && <div style={{ fontSize: 10, color: "#A0A0A0" }}>{n.brand}</div>}
                    </td>
                    <td style={{ padding: "8px 6px" }}>
                      {editingId === n.id ? (
                        <select value={editMealType} onChange={e => setEditMealType(e.target.value)} style={{ fontSize: 11, padding: "2px 4px" }}>
                          {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : <span style={{ color: "#A0A0A0" }}>{n.meal}</span>}
                    </td>
                    <td style={{ padding: "8px 6px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
                      {editingId === n.id ? (
                        <input type="number" value={editServing} onChange={e => setEditServing(+e.target.value)} style={{ width: 60, fontSize: 11, padding: "2px 4px" }} />
                      ) : `${n.servingQty || "?"} ${n.servingUnit || "g"}`}
                    </td>
                    <td style={{ padding: "8px 6px", fontWeight: 600 }}>{n.calories}</td>
                    <td style={{ padding: "8px 6px", color: "#A0A0A0" }}>{n.protein}g</td>
                    <td style={{ padding: "8px 6px", color: "#A0A0A0" }}>{n.carbs}g</td>
                    <td style={{ padding: "8px 6px", color: "#A0A0A0" }}>{n.fat}g</td>
                    <td style={{ padding: "8px 6px", color: "#A0A0A0" }}>{n.time}</td>
                    <td style={{ padding: "8px 6px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {editingId === n.id ? (
                          <>
                            <button onClick={saveEdit} style={{ background: "none", color: "#22C55E", fontSize: 12, cursor: "pointer", border: "none" }}>Save</button>
                            <button onClick={() => setEditingId(null)} style={{ background: "none", color: "#A0A0A0", fontSize: 12, cursor: "pointer", border: "none" }}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(n.id); setEditMealType(n.meal); setEditServing(n.servingQty || 100); }} style={{ background: "none", color: "#22C55E", fontSize: 12, cursor: "pointer", border: "none" }}>Edit</button>
                            <button onClick={() => duplicateFood(n)} style={{ background: "none", color: "#22C55E", fontSize: 12, cursor: "pointer", border: "none" }}>Dupe</button>
                            <button onClick={() => deleteFood(n.id)} style={{ background: "none", color: "#EF4444", fontSize: 12, cursor: "pointer", border: "none" }}>Del</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#151515", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>AI Nutrition Coach</div>
              <div style={{ fontSize: 12, color: "#A0A0A0" }}>Personalized analysis of your daily intake</div>
            </div>
          </div>
          <button className="neon-btn" onClick={getNutritionAdvice} disabled={aiLoading} style={{ fontSize: 12, padding: "8px 16px" }}>{aiLoading ? "Analyzing..." : "Get Advice"}</button>
        </div>
        {aiRec ? (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 13, color: "#FFFFFF", lineHeight: 1.7 }}>{aiRec}</p>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px", minHeight: 50 }}>
            <p style={{ fontSize: 13, color: "#A0A0A0" }}>Click "Get Advice" to receive AI-powered nutrition recommendations based on your logged food today.</p>
            {totals.calories > 0 && (
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {totals.protein < profile.protein * 0.7 && <span style={{ fontSize: 11, background: "rgba(239,68,68,0.15)", color: COLORS.red, padding: "3px 8px", borderRadius: 4 }}>Low protein: {Math.round(profile.protein - totals.protein)}g remaining</span>}
                {totals.sodium > 2000 && <span style={{ fontSize: 11, background: "rgba(255,184,0,0.15)", color: COLORS.amber, padding: "3px 8px", borderRadius: 4 }}>Sodium high: {totals.sodium}mg</span>}
                {totals.fiber < 15 && totals.calories > 500 && <span style={{ fontSize: 11, background: "rgba(255,184,0,0.15)", color: COLORS.amber, padding: "3px 8px", borderRadius: 4 }}>Fiber low: {totals.fiber}g</span>}
                {totals.calories >= profile.calories * 0.9 && totals.calories <= profile.calories && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.06)", color: COLORS.primary, padding: "3px 8px", borderRadius: 4 }}>Calorie target on track</span>}
                {waterIntake < 1500 && totals.calories > 300 && <span style={{ fontSize: 11, background: "rgba(255,184,0,0.15)", color: COLORS.amber, padding: "3px 8px", borderRadius: 4 }}>Drink more water</span>}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Nutrition;
