import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt, today, useAICoach, usdaDebouncedSearch, showToast, showConfirm, getWaterTotal } from "../utils/helpers";
import { UtensilsCrossed, Sparkles, Flame, Droplet, Search, X, Plus, Minus, Pencil, Copy, Trash2, Check, ChevronDown, ChevronRight, Apple, Drumstick, Wheat } from "lucide-react";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const MACRO_COLORS = { calories: "#C8FF32", protein: "#5AC8FA", carbs: "#FF9F0A", fat: "#8B5CF6" };

const StatCard = ({ label, value, unit, color = "#C8FF32", sub, icon: Icon }) => (
  <div className={`rd-nut-stat ${color}`}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className="l">{label}</span>
      {Icon && <Icon size={15} style={{ color: "rgba(255,255,255,0.28)" }} />}
    </div>
    <div className="v">{value}<span>{unit}</span></div>
    {sub && <div className="s">{sub}</div>}
  </div>
);

const Card = ({ children, style, className = "" }) => (
  <div className={`rd-card ${className}`} style={style}>{children}</div>
);

const CardHead = ({ icon, iconCls, kicker, title, right }) => (
  <div className="rd-card-head">
    <div className="rd-card-title">
      <div className={`rd-card-title-ico ${iconCls || ""}`}>{icon}</div>
      <div>
        {kicker && <div className="rd-card-kicker">{kicker}</div>}
        <div className="rd-card-name">{title}</div>
      </div>
    </div>
    {right}
  </div>
);

const Fade = ({ delay = 0, className, children }) => (
  <motion.div className={className}
    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}>
    {children}
  </motion.div>
);

const Nutrition = ({ state, dispatch }) => {
  const { profile, nutrition, water, settings = {} } = state;
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
  const [waterIntake, setWaterIntake] = useState(() => getWaterTotal(water, today()));
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const logFoodRef = useRef(null);

  const todayStr = today();
  const waterGoal = settings.waterGoal || 3000;

  useEffect(() => { setWaterIntake(getWaterTotal(water, todayStr)); }, [water, todayStr]);
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
    { name: "Protein", value: totals.protein * 4, color: MACRO_COLORS.protein },
    { name: "Carbs", value: totals.carbs * 4, color: MACRO_COLORS.carbs },
    { name: "Fat", value: totals.fat * 9, color: MACRO_COLORS.fat },
  ], [totals]);

  const macroData = useMemo(() => [
    { name: "Protein", value: totals.protein, target: profile.protein, color: MACRO_COLORS.protein },
    { name: "Carbs", value: totals.carbs, target: Math.round((profile.calories * 0.45) / 4), color: MACRO_COLORS.carbs },
    { name: "Fat", value: totals.fat, target: Math.round((profile.calories * 0.25) / 9), color: MACRO_COLORS.fat },
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

  const tooltipStyle = { background: "rgba(16,16,16,0.98)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#FFFFFF", fontSize: 12 };

  const calTarget = profile.calories || 2000;
  const calPct = calTarget > 0 ? Math.min((totals.calories / calTarget) * 100, 100) : 0;
  const overCal = totals.calories > calTarget;
  const calColor = overCal ? "#FF5A5F" : "#C8FF32";
  const calStatus = overCal ? "OVER TARGET" : `${Math.round(calPct)}% of target`;
  const remaining = Math.max(0, calTarget - totals.calories);
  const ringR = 86;
  const ringC = 2 * Math.PI * ringR;

  const heroMacros = [
    { label: "Protein", display: `${fmt(totals.protein)} / ${profile.protein}g`, pct: profile.protein > 0 ? Math.min((totals.protein / profile.protein) * 100, 100) : 0, color: MACRO_COLORS.protein },
    { label: "Carbs", display: `${fmt(totals.carbs)} / ${macroData[1].target}g`, pct: macroData[1].target > 0 ? Math.min((totals.carbs / macroData[1].target) * 100, 100) : 0, color: MACRO_COLORS.carbs },
    { label: "Fat", display: `${fmt(totals.fat)} / ${macroData[2].target}g`, pct: macroData[2].target > 0 ? Math.min((totals.fat / macroData[2].target) * 100, 100) : 0, color: MACRO_COLORS.fat },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="rd-page">

        {/* â•â•â• HERO â•â•â• */}
        <div className="rd-hero">
          <div className="rd-hero-grid">
            <div className="rd-hero-copy">
              <span className="rd-kicker"><UtensilsCrossed size={12} />Nutrition</span>
              <div>
                <h1 className="rd-hero-title">Fuel Your Gains</h1>
                <div className="rd-hero-date">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
              </div>
              <p className="rd-hero-sub">
                {totals.calories === 0
                  ? <>Log your first meal to unlock your daily macros, calories and hydration tracking.</>
                  : <>You've logged <b>{fmt(totals.calories)} kcal</b> of your {fmt(calTarget)} kcal target — {remaining > 0 ? <b>{fmt(remaining)} kcal</b> : <span style={{ color: "#FF5A5F" }}>over target</span>} remaining.</>}
              </p>
              <div className="rd-hero-stats">
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{fmt(remaining)}<span> kcal</span></div>
                  <div className="c-l">Remaining</div>
                </div>
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{fmt(Math.max(0, Math.round(profile.protein - totals.protein)))}<span> g</span></div>
                  <div className="c-l">Protein left</div>
                </div>
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{fmt(waterIntake)}<span> ml</span></div>
                  <div className="c-l">Water today</div>
                </div>
              </div>
              <div className="rd-hero-actions">
                <button className="rd-btn-primary" onClick={() => logFoodRef.current?.scrollIntoView({ behavior: "smooth" })}>
                  <UtensilsCrossed size={15} />Log Food
                  <ChevronRight size={15} />
                </button>
                <button className="rd-btn-secondary" onClick={getNutritionAdvice} disabled={aiLoading}>
                  <Sparkles size={15} /> {aiLoading ? "Thinking…" : "AI Advice"}
                </button>
              </div>
            </div>

            <div className="rd-hero-visual" style={{ justifyContent: "center" }}>
              <div className="rd-ring-big" style={{ filter: `drop-shadow(0 0 30px ${calColor}40)` }}>
                <svg viewBox="0 0 200 200">
                  <circle className="rr-bg" cx={100} cy={100} r={ringR} strokeWidth={14} />
                  <circle className="rr-fg" cx={100} cy={100} r={ringR} strokeWidth={14}
                    stroke={calColor}
                    strokeDasharray={`${(calPct / 100) * ringC} ${ringC}`} />
                </svg>
                <div className="rd-ring-big-center">
                  <span className="rd-ring-big-score" style={{ color: calColor }}>{fmt(totals.calories)}</span>
                  <span className="rd-ring-big-label">Calories</span>
                  <span className="rd-ring-big-status" style={{ color: calColor }}>{calStatus}</span>
                </div>
              </div>
              <div className="rd-rec-bars">
                {heroMacros.map(m => (
                  <div className="rd-rec-row" key={m.label}>
                    <span className="rr-l">{m.label}</span>
                    <div className="rr-bar"><i style={{ width: `${m.pct}%`, background: m.color }} /></div>
                    <span className="rd-rec-val" style={{ width: 92 }}>{m.display}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* â•â•â• STATS â•â•â• */}
        <Fade delay={0.06}>
          <div className="rd-nut-stats">
            <StatCard label="Calories" value={totals.calories} unit={` / ${profile.calories}`} color={totals.calories > profile.calories ? "red" : "lime"} icon={Flame} sub={<>Remaining: <b>{remaining} kcal</b></>} />
            <StatCard label="Protein" value={totals.protein} unit={`g / ${profile.protein}g`} color="blue" icon={Drumstick} sub={<>Remaining: <b>{Math.max(0, Math.round(profile.protein - totals.protein))}g</b></>} />
            <StatCard label="Carbs" value={totals.carbs} unit={`g / ${macroData[1].target}g`} color="orange" icon={Wheat} sub={<>Remaining: <b>{Math.max(0, Math.round(macroData[1].target - totals.carbs))}g</b></>} />
            <StatCard label="Fat" value={totals.fat} unit={`g / ${macroData[2].target}g`} color="purple" icon={Apple} sub={<>Remaining: <b>{Math.max(0, Math.round(macroData[2].target - totals.fat))}g</b></>} />
          </div>
        </Fade>

        <Fade delay={0.12}>
          <div className="rd-nut-stats">
            <StatCard label="Fiber" value={totals.fiber} unit="g" color="green" sub="Target: 30g" />
            <StatCard label="Sugar" value={totals.sugar} unit="g" color="orange" sub="Limit: 50g" />
            <StatCard label="Sodium" value={totals.sodium} unit="mg" color={totals.sodium > 2300 ? "red" : "green"} sub="Limit: 2300mg" />
            <StatCard label="Water" value={waterIntake} unit="ml" color="blue" icon={Droplet} sub={`Target: ${waterGoal}ml`} />
          </div>
        </Fade>

        {/* â•â•â• GRID â•â•â• */}
        <div className="rd-grid">
          <Fade className="rd-span-3 rd-card" delay={0.16}>
            <CardHead icon={<Flame size={15} />} iconCls="lime" title="Weekly Calories" />
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#A7B1C2" }} />
                <YAxis tick={{ fontSize: 10, fill: "#A7B1C2" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="calories" fill="#C8FF32" radius={[4, 4, 0, 0]} name="Calories" />
              </BarChart>
            </ResponsiveContainer>
          </Fade>

          <Fade className="rd-span-3 rd-card" delay={0.2}>
            <CardHead icon={<Drumstick size={15} />} iconCls="blue" title="Weekly Protein" />
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#A7B1C2" }} />
                <YAxis tick={{ fontSize: 10, fill: "#A7B1C2" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="protein" fill="#5AC8FA" radius={[4, 4, 0, 0]} name="Protein (g)" />
              </BarChart>
            </ResponsiveContainer>
          </Fade>

          <Fade className="rd-span-3 rd-card" delay={0.24}>
            <CardHead icon={<Apple size={15} />} iconCls="orange" title="Macro Distribution" />
            {totals.calories > 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={macroPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                      {macroPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="rd-legend" style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                  {macroPieData.map(m => (
                    <div key={m.name} className="rd-legend-item" style={{ gap: 8, fontSize: 12 }}>
                      <span className="rd-legend-dot" style={{ background: m.color }} />
                      <span style={{ color: "rgba(255,255,255,0.6)" }}>{m.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#FFFFFF", fontWeight: 700 }}>{fmt(m.value)} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rd-empty" style={{ minHeight: 140 }}>
                <div className="rd-empty-title">No food logged today</div>
                <div className="rd-empty-sub">Search and log a food to see your macro split.</div>
              </div>
            )}
          </Fade>

          <Fade className="rd-span-3 rd-card" delay={0.28}>
            <CardHead icon={<Droplet size={15} />} iconCls="blue" title="Water Intake" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="rd-metric-label">Daily target</span>
                  <span className="rd-big-metric" style={{ fontSize: 22 }}>{waterIntake}<span> / {waterGoal} ml</span></span>
                </div>
                <div className="rd-water-track">
                  <div className="rd-water-fill" style={{ width: `${Math.min((waterIntake / waterGoal) * 100, 100)}%` }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {[-250, -100, 100, 250, 500].map(amt => (
                  <button key={amt} className="rd-water-btn" onClick={() => changeWater(amt)} style={{ fontSize: 11, padding: "8px 12px" }}>
                    {amt > 0 ? <Plus size={12} /> : <Minus size={12} />} {Math.abs(amt)} ml
                  </button>
                ))}
              </div>
            </div>
          </Fade>
        </div>

        <Fade className="rd-card" delay={0.32}>
          <CardHead icon={<Flame size={15} />} iconCls="lime" title="Macro Progress" />
          <div>
            {macroData.map(m => {
              const pct = m.target > 0 ? Math.min((m.value / m.target) * 100, 100) : 0;
              return (
                <div key={m.name} className="rd-macro">
                  <div className="rd-macro-head">
                    <span className="rd-macro-label">{m.name}</span>
                    <span className="rd-macro-val"><b>{fmt(m.value)}</b> / {m.target}g</span>
                  </div>
                  <div className="rd-macro-track">
                    <div className="rd-macro-fill" style={{ width: `${pct}%`, background: m.color, boxShadow: `0 0 10px ${m.color}55` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Fade>

        <div ref={logFoodRef} style={{ scrollMarginTop: 16 }}>
          <Fade className="rd-card" delay={0.36}>
            <CardHead icon={<Search size={15} />} iconCls="lime" title="Log Food from USDA Database" />
            <div style={{ position: "relative", marginBottom: 14 }}>
              <div ref={searchRef} style={{ position: "relative" }}>
                <div className="rd-search">
                  <Search size={15} />
                  <input
                    value={searchQuery}
                    onChange={e => { handleSearch(e.target.value); setSelectedFood(null); }}
                    onFocus={() => { if (searchResults.length > 0 || searchLoading) setShowDropdown(true); }}
                    placeholder="Search foods (e.g., chicken breast, rice, banana)..."
                  />
                </div>
                {searchLoading && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Searching...</div>}
              </div>
              {showDropdown && !selectedFood && (
                <div ref={dropdownRef} className="rd-search-dropdown">
                  {searchError && (
                    <div style={{ padding: 16, textAlign: "center" }}>
                      <p style={{ fontSize: 13, color: "#FF5A5F", marginBottom: 8 }}>API Error: {searchError}</p>
                      <button className="rd-btn-secondary" onClick={() => handleSearch(searchQuery)} style={{ padding: "8px 14px", fontSize: 12 }}>Retry</button>
                    </div>
                  )}
                  {!searchLoading && !searchError && searchResults.length === 0 && searchQuery.length >= 2 && (
                    <div style={{ padding: 16, textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>No foods found for "{searchQuery}"</div>
                  )}
                  {searchResults.map((food, i) => (
                    <div key={i} className="rd-search-item" onClick={() => selectFood(food)}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{food.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        {food.brand && <span>{food.brand} · </span>}
                        {food.calories} kcal · <span style={{ color: "#5AC8FA" }}>P {food.protein}g</span> · <span style={{ color: "#FF9F0A" }}>C {food.carbs}g</span> · <span style={{ color: "#8B5CF6" }}>F {food.fat}g</span> per {food.servingSize}{food.servingUnit}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedFood && scaledPreview && (
              <div className="rd-food-preview">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div className="rd-food-name">{selectedFood.name}</div>
                    {selectedFood.brand && <div className="rd-food-brand">{selectedFood.brand}</div>}
                  </div>
                  <button className="rd-iconbtn danger" onClick={() => { setSelectedFood(null); setSearchQuery(""); }}><X size={16} /></button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Serving:</span>
                  <input className="rd-input" type="number" value={servingQty} onChange={e => setServingQty(Math.max(1, +e.target.value))} style={{ width: 74, height: 34, textAlign: "center", padding: 0, fontSize: 13 }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{selectedFood.servingUnit || "g"}</span>
                  {servingOptions.length > 0 && servingOptions.slice(0, 4).map(opt => (
                    <button key={opt.value} className={`rd-chip ${servingQty === opt.value ? "active" : ""}`} style={{ padding: "6px 12px", fontSize: 11 }} onClick={() => setServingQty(opt.value)}>{opt.label}</button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
                  {[["Calories", scaledPreview.calories, "kcal"], ["Protein", scaledPreview.protein, "g"], ["Carbs", scaledPreview.carbs, "g"], ["Fat", scaledPreview.fat, "g"], ["Sat. Fat", scaledPreview.saturatedFat, "g"], ["Fiber", scaledPreview.fiber, "g"], ["Sugar", scaledPreview.sugar, "g"], ["Sodium", scaledPreview.sodium, "mg"], ["Potassium", scaledPreview.potassium, "mg"], ["Cholesterol", scaledPreview.cholesterol, "mg"]].map(([label, val, unit]) => (
                    <div key={label} className="rd-macro-mini">
                      <div className="l">{label}</div>
                      <div className="v">{val}<span>{unit}</span></div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Meal:</span>
                  {MEAL_TYPES.map(m => (
                    <button key={m} className={`rd-chip ${mealType === m ? "active" : ""}`} style={{ padding: "6px 12px", fontSize: 11 }} onClick={() => setMealType(m)}>{m}</button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <button className="rd-btn-primary" onClick={logFood} style={{ padding: "10px 20px", fontSize: 13 }}><Check size={15} /> Log Food Entry</button>
                </div>
              </div>
            )}
          </Fade>
        </div>

        <Fade className="rd-card" delay={0.4}>
          <CardHead icon={<UtensilsCrossed size={15} />} iconCls="blue" title="Today's Food Log" right={todayLog.length > 0 && <span className="rd-count">{todayLog.length} items</span>} />
          {todayLog.length === 0 ? (
            <div className="rd-empty" style={{ padding: 20 }}>
              <div className="rd-empty-title">No food logged yet</div>
              <div className="rd-empty-sub">Search for a food above to get started.</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="rd-table">
                <thead>
                  <tr>
                    <th>Food</th><th>Meal</th><th>Serving</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Time</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {todayLog.map((n) => (
                    <tr key={n.id}>
                      <td>
                        <div className="food-name">{n.food}</div>
                        {n.brand && <div className="food-brand">{n.brand}</div>}
                      </td>
                      <td>
                        {editingId === n.id ? (
                          <div className="rd-select-wrap">
                            <select className="rd-input" value={editMealType} onChange={e => setEditMealType(e.target.value)} style={{ height: 30, padding: "0 28px 0 10px", fontSize: 11 }}>
                              {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <ChevronDown size={14} />
                          </div>
                        ) : <span style={{ color: "rgba(255,255,255,0.5)" }}>{n.meal}</span>}
                      </td>
                      <td className="num">
                        {editingId === n.id ? (
                          <input className="rd-input" type="number" value={editServing} onChange={e => setEditServing(+e.target.value)} style={{ width: 64, height: 30, padding: 0, textAlign: "center", fontSize: 11 }} />
                        ) : `${n.servingQty || "?"} ${n.servingUnit || "g"}`}
                      </td>
                      <td className="num cal">{n.calories}</td>
                      <td className="num" style={{ color: "#5AC8FA" }}>{n.protein}g</td>
                      <td className="num" style={{ color: "#FF9F0A" }}>{n.carbs}g</td>
                      <td className="num" style={{ color: "#8B5CF6" }}>{n.fat}g</td>
                      <td className="num" style={{ color: "rgba(255,255,255,0.4)" }}>{n.time}</td>
                      <td>
                        <div style={{ display: "flex", gap: 2 }}>
                          {editingId === n.id ? (
                            <>
                              <button className="rd-iconbtn lime" onClick={saveEdit} title="Save"><Check size={15} /></button>
                              <button className="rd-iconbtn" onClick={() => setEditingId(null)} title="Cancel"><X size={15} /></button>
                            </>
                          ) : (
                            <>
                              <button className="rd-iconbtn lime" onClick={() => { setEditingId(n.id); setEditMealType(n.meal); setEditServing(n.servingQty || 100); }} title="Edit"><Pencil size={15} /></button>
                              <button className="rd-iconbtn orange" onClick={() => duplicateFood(n)} title="Duplicate"><Copy size={15} /></button>
                              <button className="rd-iconbtn danger" onClick={() => deleteFood(n.id)} title="Delete"><Trash2 size={15} /></button>
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
        </Fade>

        <Fade className="rd-card rd-ai-card" delay={0.44}>
          <CardHead icon={<Sparkles size={15} />} iconCls="lime" title="AI Nutrition Coach" kicker="PERSONALIZED ADVICE"
            right={
              <button className="rd-btn-primary" onClick={getNutritionAdvice} disabled={aiLoading} style={{ padding: "9px 16px", fontSize: 12 }}>
                <Sparkles size={14} /> {aiLoading ? "Analyzing..." : "Get Advice"}
              </button>
            } />
          {aiRec ? (
            <div className="rd-nut-advice">{aiRec}</div>
          ) : (
            <div>
              <div className="rd-nut-advice" style={{ color: "rgba(255,255,255,0.55)" }}>
                Click "Get Advice" to receive AI-powered nutrition recommendations based on your logged food today.
              </div>
              {totals.calories > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {totals.protein < profile.protein * 0.7 && <span className="rd-chip" style={{ background: "rgba(255,90,95,0.12)", borderColor: "rgba(255,90,95,0.3)", color: "#FF5A5F", fontSize: 11 }}>Low protein: {Math.round(profile.protein - totals.protein)}g remaining</span>}
                  {totals.sodium > 2000 && <span className="rd-chip" style={{ background: "rgba(255,159,10,0.12)", borderColor: "rgba(255,159,10,0.3)", color: "#FF9F0A", fontSize: 11 }}>Sodium high: {totals.sodium}mg</span>}
                  {totals.fiber < 15 && totals.calories > 500 && <span className="rd-chip" style={{ background: "rgba(255,159,10,0.12)", borderColor: "rgba(255,159,10,0.3)", color: "#FF9F0A", fontSize: 11 }}>Fiber low: {totals.fiber}g</span>}
                  {totals.calories >= profile.calories * 0.9 && totals.calories <= profile.calories && <span className="rd-chip" style={{ background: "rgba(200,255,50,0.12)", borderColor: "rgba(200,255,50,0.3)", color: "#C8FF32", fontSize: 11 }}>Calorie target on track</span>}
                  {waterIntake < 1500 && totals.calories > 300 && <span className="rd-chip" style={{ background: "rgba(90,200,250,0.12)", borderColor: "rgba(90,200,250,0.3)", color: "#5AC8FA", fontSize: 11 }}>Drink more water</span>}
                </div>
              )}
            </div>
          )}
        </Fade>
      </div>
    </motion.div>
  );
};

export default Nutrition;
