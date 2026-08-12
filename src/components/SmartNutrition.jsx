import React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Database, Star, Search, X, Plus, Minus, Trash2, Heart, Check, Save, UtensilsCrossed, Flame } from 'lucide-react';

const FOOD_DATABASE = [
  { id: 'b1', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 'b2', name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  { id: 'b3', name: 'White Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: 'b4', name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { id: 'b5', name: 'Oats', calories: 389, protein: 17, carbs: 66, fat: 6.9 },
  { id: 'b6', name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { id: 'b7', name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { id: 'b8', name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { id: 'b9', name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { id: 'b10', name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { id: 'b11', name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50 },
  { id: 'b12', name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { id: 'b13', name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { id: 'b14', name: 'Whey Protein', calories: 352, protein: 80, carbs: 8, fat: 1.5 },
  { id: 'b15', name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fat: 3.4 },
  { id: 'b16', name: 'Pasta', calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  { id: 'b17', name: 'Tuna', calories: 132, protein: 28, carbs: 0, fat: 1.3 },
  { id: 'b18', name: 'Ground Beef', calories: 254, protein: 17, carbs: 0, fat: 20 },
  { id: 'b19', name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fat: 1 },
  { id: 'b20', name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  { id: 'b21', name: 'Lentils', calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { id: 'b22', name: 'Black Beans', calories: 132, protein: 8.9, carbs: 23, fat: 0.5 },
  { id: 'b23', name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50 },
  { id: 'b24', name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100 },
  { id: 'b25', name: 'Honey', calories: 304, protein: 0.3, carbs: 82, fat: 0 },
  { id: 'b26', name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { id: 'b27', name: 'Strawberries', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { id: 'b28', name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { id: 'b29', name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: 'b30', name: 'Kale', calories: 49, protein: 4.3, carbs: 9, fat: 0.9 },
  { id: 'b31', name: 'Carrots', calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { id: 'b32', name: 'Cucumber', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { id: 'b33', name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { id: 'b34', name: 'Bell Pepper', calories: 31, protein: 1, carbs: 6, fat: 0.3 },
  { id: 'b35', name: 'Milk (Whole)', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { id: 'b36', name: 'Milk (Skim)', calories: 34, protein: 3.4, carbs: 5, fat: 0.1 },
  { id: 'b37', name: 'Cheese (Cheddar)', calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  { id: 'b38', name: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  { id: 'b39', name: 'Bacon', calories: 541, protein: 37, carbs: 1.4, fat: 42 },
  { id: 'b40', name: 'Sausage', calories: 301, protein: 12, carbs: 2, fat: 27 },
  { id: 'b41', name: 'Shrimp', calories: 85, protein: 20, carbs: 0.2, fat: 0.5 },
  { id: 'b42', name: 'Tilapia', calories: 96, protein: 20, carbs: 0, fat: 1.7 },
  { id: 'b43', name: 'Cod', calories: 82, protein: 18, carbs: 0, fat: 0.7 },
  { id: 'b44', name: 'Quinoa', calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { id: 'b45', name: 'Chickpeas', calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  { id: 'b46', name: 'Hummus', calories: 166, protein: 7.9, carbs: 14, fat: 10 },
  { id: 'b47', name: 'Cashews', calories: 553, protein: 18, carbs: 30, fat: 44 },
  { id: 'b48', name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fat: 65 },
  { id: 'b49', name: 'Pumpkin Seeds', calories: 559, protein: 30, carbs: 11, fat: 49 },
  { id: 'b50', name: 'Dark Chocolate', calories: 546, protein: 5, carbs: 60, fat: 31 },
  { id: 'b51', name: 'Coconut Oil', calories: 862, protein: 0, carbs: 0, fat: 100 },
  { id: 'b52', name: 'Potato', calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  { id: 'b53', name: 'Corn', calories: 86, protein: 3.2, carbs: 19, fat: 1.2 },
  { id: 'b54', name: 'Pineapple', calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  { id: 'b55', name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  { id: 'b56', name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { id: 'b57', name: 'Watermelon', calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
  { id: 'b58', name: 'Egg White', calories: 52, protein: 11, carbs: 0.7, fat: 0.2 },
  { id: 'b59', name: 'Protein Bar', calories: 350, protein: 20, carbs: 40, fat: 11 },
  { id: 'b60', name: 'Granola', calories: 471, protein: 10, carbs: 64, fat: 20 },
];

const MACRO_COLORS = { calories: '#C8FF32', protein: '#5AC8FA', carbs: '#FF9F0A', fat: '#8B5CF6' };

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function MacroRing({ value, max, label, color, size = 110, strokeWidth = 8 }) {
  const pct = Math.min(value / (max || 1), 1);
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ * pct;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div className="rd-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} className="rd-ring-bg" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} className="rd-ring-fg" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="rd-ring-center">
          <span className="rd-ring-value" style={{ fontSize: size * 0.16 }}>{Math.round(value)}</span>
        </div>
      </div>
      <span className="rd-ring-label">{label}</span>
    </div>
  );
}

function FoodCard({ food, onClick, onAdd, compact }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rd-ex-row"
      style={{ padding: compact ? '10px 14px' : '13px 16px', marginBottom: 8 }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{food.name}</div>
        <div className="rd-meal-meta" style={{ fontSize: 11 }}>
          <span>{Math.round(food.calories)} kcal</span>
          <span className="p">P {Math.round(food.protein)}g</span>
          <span className="c">C {Math.round(food.carbs)}g</span>
          <span className="f">F {Math.round(food.fat)}g</span>
        </div>
      </div>
      {onAdd && (
        <button
          className="rd-mini-btn rd-food-add"
          onClick={(e) => { e.stopPropagation(); onAdd(food); }}
        >
          <Plus size={13} /> Add
        </button>
      )}
    </motion.div>
  );
}

function AddMealModal({ food, onSave, onClose }) {
  const [grams, setGrams] = useState(100);
  const [meal, setMeal] = useState('Breakfast');
  const factor = grams / 100;
  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <motion.div className="rd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="rd-modal" style={{ maxWidth: 420 }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <button className="rd-modal-close" onClick={onClose}><X size={16} /></button>
        <div className="rd-modal-title" style={{ marginBottom: 20 }}>{food.name}</div>

        <div style={{ marginBottom: 20 }}>
          <label className="rd-field"><span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grams</span></label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="rd-stepper">
              <button className="rd-step-btn" onClick={() => setGrams(g => Math.max(10, g - 25))}><Minus size={14} /></button>
              <input
                type="number" value={grams} min={1}
                onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                className="rd-input" style={{ width: 84, textAlign: 'center', padding: '9px 0', fontSize: 14 }}
              />
              <button className="rd-step-btn" onClick={() => setGrams(g => Math.min(1000, g + 25))}><Plus size={14} /></button>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>g</span>
            <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
              {[50, 100, 150, 200, 250].map(v => (
                <button key={v} className={`rd-chip ${grams === v ? 'active' : ''}`} style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => setGrams(v)}>{v}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="rd-field"><span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Meal</span></label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {meals.map((m) => (
              <button key={m} className={`rd-chip ${meal === m ? 'active' : ''}`} onClick={() => setMeal(m)} style={{ padding: '8px 14px', fontSize: 12 }}>{m}</button>
            ))}
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: 14, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13,
        }}>
          <div style={{ color: '#C8FF32', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(food.calories * factor)} kcal</div>
          <div style={{ color: '#5AC8FA' }}>Protein: {Math.round(food.protein * factor)}g</div>
          <div style={{ color: '#FF9F0A' }}>Carbs: {Math.round(food.carbs * factor)}g</div>
          <div style={{ color: '#8B5CF6' }}>Fat: {Math.round(food.fat * factor)}g</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="rd-btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="rd-btn-primary" onClick={() => onSave({
            food: food.name,
            calories: Math.round(food.calories * factor),
            protein: Math.round(food.protein * factor * 10) / 10,
            carbs: Math.round(food.carbs * factor * 10) / 10,
            fat: Math.round(food.fat * factor * 10) / 10,
            meal,
            grams,
          })} style={{ flex: 1 }}><Check size={15} /> Add to {meal}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FavoriteCard({ fav, onAdd, onRemove }) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} className="rd-meal-row">
      <div className="rd-card-title-ico purple" style={{ flexShrink: 0 }}><Heart size={15} /></div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>{fav.name}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fav.items.map((i) => i.food).join(', ')}
        </div>
        <div className="rd-meal-meta" style={{ fontSize: 11 }}>
          <span>{fav.totalCalories} kcal</span>
          <span className="p">P {fav.totalProtein}g</span>
          <span className="c">C {fav.totalCarbs}g</span>
          <span className="f">F {fav.totalFat}g</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button className="rd-mini-btn" onClick={() => onAdd(fav)} style={{ color: '#C8FF32', borderColor: 'rgba(200,255,50,0.25)' }}><Plus size={13} /> Quick Add</button>
        <button className="rd-mini-btn danger" onClick={() => onRemove(fav.id)}><Trash2 size={13} /></button>
      </div>
    </motion.div>
  );
}

export default function SmartNutrition({ state, dispatch }) {
  const [activeTab, setActiveTab] = useState('today');
  const [search, setSearch] = useState('');
  const [usdaResults, setUsdaResults] = useState([]);
  const [loadingUsda, setLoadingUsda] = useState(false);
  const [modalFood, setModalFood] = useState(null);
  const favorites = state.favoriteMeals || [];
  const [favName, setFavName] = useState('');
  const [showSaveFav, setShowSaveFav] = useState(false);
  const [todayMealSelection, setTodayMealSelection] = useState('all');
  const abortRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = useMemo(
    () => (state.nutrition || []).filter((m) => m.date === today),
    [state.nutrition, today]
  );

  const targets = state.profile || { calories: 2200, protein: 160, carbs: 250, fat: 73 };
  const totals = useMemo(() => {
    return todayMeals.reduce(
      (a, m) => ({
        calories: a.calories + (m.calories || 0),
        protein: a.protein + (m.protein || 0),
        carbs: a.carbs + (m.carbs || 0),
        fat: a.fat + (m.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayMeals]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query) => {
        if (!query.trim() || query.trim().length < 2) {
          setUsdaResults([]);
          setLoadingUsda(false);
          return;
        }
        setLoadingUsda(true);
        try {
          if (abortRef.current) abortRef.current.abort();
          abortRef.current = new AbortController();
          const res = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=DEMO_KEY`,
            { signal: abortRef.current.signal }
          );
          const data = await res.json();
          const items = (data.foods || []).map((f, i) => ({
            id: `usda-${f.fdcId}-${i}`,
            name: f.description || f.dataType,
            calories: f.foodNutrients?.find((n) => n.nutrientNumber === '208')?.value || 0,
            protein: f.foodNutrients?.find((n) => n.nutrientNumber === '203')?.value || 0,
            carbs: f.foodNutrients?.find((n) => n.nutrientNumber === '205')?.value || 0,
            fat: f.foodNutrients?.find((n) => n.nutrientNumber === '204')?.value || 0,
            source: 'USDA',
          }));
          setUsdaResults(items);
        } catch (e) {
          if (e.name !== 'AbortError') setUsdaResults([]);
        }
        setLoadingUsda(false);
      }, 400),
    []
  );

  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  // One-time migration: legacy localStorage favorites → app state (persisted to Firestore/local).
  useEffect(() => {
    if ((state.favoriteMeals || []).length > 0) return;
    try {
      const legacy = JSON.parse(localStorage.getItem('nutrition_favorites') || '[]');
      if (Array.isArray(legacy) && legacy.length) {
        legacy.forEach((fav) => dispatch({ type: 'ADD_FAVORITE_MEAL', payload: fav }));
        localStorage.removeItem('nutrition_favorites');
      }
    } catch {}
  }, [dispatch, state.favoriteMeals]);

  const filteredDb = useMemo(() => {
    if (!search.trim()) return FOOD_DATABASE;
    const q = search.toLowerCase();
    return FOOD_DATABASE.filter((f) => f.name.toLowerCase().includes(q));
  }, [search]);

  const allFoods = [...filteredDb, ...usdaResults];

  const handleAddFood = useCallback((data) => {
    dispatch({
      type: 'ADD_NUTRITION',
      payload: {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: today,
        ...data,
      },
    });
    setModalFood(null);
  }, [dispatch, today]);

  const handleDeleteMeal = useCallback((id) => {
    dispatch({ type: 'DELETE_NUTRITION', payload: id });
  }, [dispatch]);

  const handleSaveFavorite = useCallback(() => {
    if (!favName.trim() || todayMeals.length === 0) return;
    const fav = {
      id: `fav-${Date.now()}`,
      name: favName.trim(),
      items: todayMeals.map((m) => ({ food: m.food, grams: m.grams || 100, ...m })),
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
    };
    dispatch({ type: 'ADD_FAVORITE_MEAL', payload: fav });
    setFavName('');
    setShowSaveFav(false);
  }, [dispatch, favName, todayMeals, totals]);

  const handleQuickAddFav = useCallback((fav) => {
    fav.items.forEach((item) => {
      dispatch({
        type: 'ADD_NUTRITION',
        payload: {
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          date: today,
          food: item.food,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          meal: item.meal,
          grams: item.grams,
        },
      });
    });
  }, [dispatch, today]);

  const handleRemoveFavorite = useCallback((id) => {
    dispatch({ type: 'REMOVE_FAVORITE_MEAL', payload: id });
  }, [dispatch]);

  const tabs = [
    { key: 'today', label: 'Today', icon: CalendarDays },
    { key: 'database', label: 'Food Database', icon: Database },
    { key: 'favorites', label: 'Favorites', icon: Star },
  ];

  const groupedMeals = useMemo(() => {
    const groups = {};
    todayMeals.forEach((m) => {
      if (!groups[m.meal]) groups[m.meal] = [];
      groups[m.meal].push(m);
    });
    return groups;
  }, [todayMeals]);

  const filteredMeals = todayMealSelection === 'all'
    ? todayMeals
    : todayMeals.filter((m) => m.meal === todayMealSelection);

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><UtensilsCrossed size={13} /> Smart Nutrition</span>
          <h1 className="rd-title">Meal Tracker</h1>
          <p className="rd-sub">Log meals, browse foods, and save your favorite combos.</p>
        </div>
      </div>

      <div className="rd-tabbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} className={`rd-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
          <motion.div key="today" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
            <div className="rd-card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
                <MacroRing value={totals.calories} max={targets.calories} label="Calories" color={MACRO_COLORS.calories} />
                <MacroRing value={totals.protein} max={targets.protein} label="Protein" color={MACRO_COLORS.protein} />
                <MacroRing value={totals.carbs} max={targets.carbs} label="Carbs" color={MACRO_COLORS.carbs} />
                <MacroRing value={totals.fat} max={targets.fat} label="Fat" color={MACRO_COLORS.fat} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 18 }}>
                {[
                  { label: 'Calories', current: totals.calories, target: targets.calories, color: '#C8FF32' },
                  { label: 'Protein', current: totals.protein, target: targets.protein, color: '#5AC8FA' },
                  { label: 'Carbs', current: totals.carbs, target: targets.carbs, color: '#FF9F0A' },
                  { label: 'Fat', current: totals.fat, target: targets.fat, color: '#8B5CF6' },
                ].map((m) => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                    <div style={{ color: m.color, fontWeight: 700, fontSize: 14, fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>
                      {Math.max(0, Math.round(m.target - m.current))} left
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Meals</h3>
              <button className="rd-mini-btn" onClick={() => setShowSaveFav(true)} disabled={todayMeals.length === 0}
                style={{ opacity: todayMeals.length === 0 ? 0.4 : 1 }}>
                <Save size={13} /> Save as Fav
              </button>
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
              <button className={`rd-chip ${todayMealSelection === 'all' ? 'active' : ''}`} style={{ padding: '7px 14px', fontSize: 11 }} onClick={() => setTodayMealSelection('all')}>
                All ({todayMeals.length})
              </button>
              {mealTypes.map((mt) => (
                <button key={mt} className={`rd-chip ${todayMealSelection === mt ? 'active' : ''}`} style={{ padding: '7px 14px', fontSize: 11 }} onClick={() => setTodayMealSelection(mt)}>
                  {mt} ({(groupedMeals[mt] || []).length})
                </button>
              ))}
            </div>

            <AnimatePresence>
              {filteredMeals.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rd-card rd-empty" style={{ padding: 40 }}>
                  <div className="rd-empty-title">No meals logged yet</div>
                  <div className="rd-empty-sub">Add food from the Food Database tab</div>
                </motion.div>
              )}
              {filteredMeals.map((meal) => (
                <motion.div key={meal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} layout className="rd-meal-row">
                  <div className="rd-card-title-ico lime" style={{ flexShrink: 0 }}><Flame size={15} /></div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="rd-meal-tag">{meal.meal}</div>
                    <div className="rd-meal-name">{meal.food} {meal.grams ? `(${meal.grams}g)` : ''}</div>
                    <div className="rd-meal-meta" style={{ fontSize: 11 }}>
                      <span>{meal.calories} kcal</span>
                      <span className="p">P {meal.protein}g</span>
                      <span className="c">C {meal.carbs}g</span>
                      <span className="f">F {meal.fat}g</span>
                    </div>
                  </div>
                  <button className="rd-iconbtn danger" onClick={() => handleDeleteMeal(meal.id)} style={{ flexShrink: 0 }}><Trash2 size={15} /></button>
                </motion.div>
              ))}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="rd-btn-primary" onClick={() => setActiveTab('database')} style={{ flex: 1, width: '100%' }}>
                <Plus size={15} /> Add Food
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'database' && (
          <motion.div key="database" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
            <div className="rd-card" style={{ padding: 18, marginBottom: 16 }}>
              <div className="rd-search">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search food..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="rd-iconbtn" onClick={() => { setSearch(''); setUsdaResults([]); }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}><X size={15} /></button>
                )}
              </div>
            </div>

            {search.trim().length >= 2 && usdaResults.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="rd-legend" style={{ marginBottom: 10 }}>
                  <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: '#C8FF32' }} /> USDA API Results</span>
                </div>
                {usdaResults.map((food) => (
                  <FoodCard key={food.id} food={food} onAdd={setModalFood} compact />
                ))}
              </div>
            )}

            {loadingUsda && (
              <div style={{ textAlign: 'center', padding: 16, color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>Searching USDA database...</div>
            )}

            <div className="rd-legend" style={{ marginBottom: 10 }}>
              <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: '#5AC8FA' }} /> Built-in Database ({filteredDb.length})</span>
            </div>
            {filteredDb.map((food) => (
              <FoodCard key={food.id} food={food} onAdd={setModalFood} />
            ))}
            {filteredDb.length === 0 && search.trim() && (
              <div className="rd-card rd-empty" style={{ padding: 30 }}>
                No foods match "{search}"
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div key="favorites" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
            {showSaveFav && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rd-card" style={{ marginBottom: 16, border: '1px solid rgba(200,255,50,0.25)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 10 }}>Save Today's Meals as Favorite</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Favorite name..."
                    value={favName}
                    onChange={(e) => setFavName(e.target.value)}
                    className="rd-input"
                    style={{ flex: 1, minWidth: 140 }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveFavorite(); }}
                  />
                  <button className="rd-btn-primary" onClick={handleSaveFavorite} disabled={!favName.trim()} style={{ padding: '10px 18px', fontSize: 12, opacity: favName.trim() ? 1 : 0.5 }}><Check size={14} /> Save</button>
                  <button className="rd-btn-secondary" onClick={() => { setShowSaveFav(false); setFavName(''); }} style={{ padding: '10px 14px', fontSize: 12 }}>Cancel</button>
                </div>
              </motion.div>
            )}

            {favorites.length === 0 ? (
              <div className="rd-card rd-empty" style={{ padding: 40 }}>
                <div className="rd-card-title-ico purple" style={{ width: 48, height: 48, borderRadius: 14, margin: '0 auto 12px' }}><Heart size={22} /></div>
                <div className="rd-empty-title">No favorites yet</div>
                <div className="rd-empty-sub">Log meals today, then save them as a favorite</div>
                <button className="rd-btn-primary" onClick={() => { setActiveTab('today'); }} style={{ marginTop: 12 }}>Go to Today</button>
              </div>
            ) : (
              favorites.map((fav) => (
                <FavoriteCard key={fav.id} fav={fav} onAdd={handleQuickAddFav} onRemove={handleRemoveFavorite} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalFood && (
          <AddMealModal food={modalFood} onSave={handleAddFood} onClose={() => setModalFood(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
