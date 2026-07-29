import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

const colors = {
  bg: '#0A0A0A',
  surface: '#151515',
  surfaceLight: '#1E1E1E',
  neon: '#22C55E',
  secondary: '#A0A0A0',
  danger: '#FF4444',
  white: '#FFFFFF',
  card: '#1A1A1A',
};

const ringStyles = {
  container: { position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  svg: { transform: 'rotate(-90deg)' },
  track: { fill: 'none', stroke: '#2A2A2A' },
  fill: { fill: 'none', strokeLinecap: 'round', transition: 'stroke-dashoffset 0.6s ease' },
  label: { position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
};

const buttonBase = {
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 600,
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
};

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
  const offset = circ * (1 - pct);
  return (
    <div style={{ ...ringStyles.container, width: size, height: size }}>
      <svg width={size} height={size} style={ringStyles.svg}>
        <circle cx={size / 2} cy={size / 2} r={radius} style={{ ...ringStyles.track, strokeWidth }} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          style={{ ...ringStyles.fill, stroke: color, strokeWidth, strokeDasharray: circ, strokeDashoffset: offset }}
        />
      </svg>
      <div style={ringStyles.label}>
        <span style={{ fontSize: 14, fontWeight: 700, color: colors.white }}>{Math.round(value)}</span>
        <span style={{ fontSize: 10, color: colors.secondary }}>{label}</span>
      </div>
    </div>
  );
}

function FoodCard({ food, onClick, onAdd, compact }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: hovered ? colors.surfaceLight : colors.card,
        border: `1px solid ${hovered ? '#333' : '#222'}`,
        borderRadius: 12,
        padding: compact ? '10px 14px' : '14px 16px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: colors.white, marginBottom: 4 }}>{food.name}</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: colors.secondary }}>
          <span>{Math.round(food.calories)} kcal</span>
          <span style={{ color: '#6EC6FF' }}>P: {Math.round(food.protein)}g</span>
          <span style={{ color: '#FFB74D' }}>C: {Math.round(food.carbs)}g</span>
          <span style={{ color: '#FF8A80' }}>F: {Math.round(food.fat)}g</span>
        </div>
      </div>
      {onAdd && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            ...buttonBase,
            background: hovered ? colors.neon : 'transparent',
            color: hovered ? colors.bg : colors.neon,
            border: `1px solid ${colors.neon}`,
            padding: '6px 14px',
            fontSize: 12,
            marginLeft: 10,
          }}
          onClick={(e) => { e.stopPropagation(); onAdd(food); }}
        >
          + Add
        </motion.button>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.surface, borderRadius: 20, padding: 28,
          width: '90%', maxWidth: 400, border: '1px solid #333',
        }}
      >
        <h3 style={{ margin: '0 0 20px', color: colors.white, fontSize: 18, fontWeight: 700 }}>{food.name}</h3>

        <div style={{ marginBottom: 20 }}>
          <label style={{ color: colors.secondary, fontSize: 12, display: 'block', marginBottom: 6 }}>Grams</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="range" min={10} max={500} step={10} value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              style={{ flex: 1, accentColor: colors.neon }}
            />
            <input
              type="number" value={grams} min={1}
              onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
              style={{
                width: 70, background: colors.card, border: '1px solid #333',
                borderRadius: 8, color: colors.white, textAlign: 'center',
                fontSize: 14, padding: '6px 0', outline: 'none',
              }}
            />
            <span style={{ color: colors.secondary, alignSelf: 'center', fontSize: 13 }}>g</span>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ color: colors.secondary, fontSize: 12, display: 'block', marginBottom: 6 }}>Meal</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {meals.map((m) => (
              <button
                key={m}
                onClick={() => setMeal(m)}
                style={{
                  ...buttonBase,
                  background: meal === m ? colors.neon : colors.card,
                  color: meal === m ? colors.bg : colors.secondary,
                  border: `1px solid ${meal === m ? colors.neon : '#333'}`,
                  padding: '8px 12px',
                  fontSize: 12,
                  flex: 1,
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: colors.card, borderRadius: 12, padding: 14,
          marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 8, fontSize: 13,
        }}>
          <div style={{ color: colors.neon, fontWeight: 600 }}>{Math.round(food.calories * factor)} kcal</div>
          <div style={{ color: '#6EC6FF' }}>Protein: {Math.round(food.protein * factor)}g</div>
          <div style={{ color: '#FFB74D' }}>Carbs: {Math.round(food.carbs * factor)}g</div>
          <div style={{ color: '#FF8A80' }}>Fat: {Math.round(food.fat * factor)}g</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              ...buttonBase, flex: 1, padding: '12px 0',
              background: colors.card, color: colors.secondary, border: '1px solid #333',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({
              food: food.name,
              calories: Math.round(food.calories * factor),
              protein: Math.round(food.protein * factor * 10) / 10,
              carbs: Math.round(food.carbs * factor * 10) / 10,
              fat: Math.round(food.fat * factor * 10) / 10,
              meal,
              grams,
            })}
            style={{
              ...buttonBase, flex: 1, padding: '12px 0',
              background: colors.neon, color: colors.bg,
            }}
          >
            Add to {meal}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FavoriteCard({ fav, onAdd, onRemove }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.card, border: `1px solid ${hovered ? '#333' : '#222'}`,
        borderRadius: 12, padding: '14px 16px', marginBottom: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.white, marginBottom: 4 }}>{fav.name}</div>
        <div style={{ fontSize: 11, color: colors.secondary }}>
          {fav.items.map((i) => i.food).join(', ')}
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: colors.secondary, marginTop: 4 }}>
          <span>{fav.totalCalories} kcal</span>
          <span style={{ color: '#6EC6FF' }}>P: {fav.totalProtein}g</span>
          <span style={{ color: '#FFB74D' }}>C: {fav.totalCarbs}g</span>
          <span style={{ color: '#FF8A80' }}>F: {fav.totalFat}g</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onAdd(fav)}
          style={{
            ...buttonBase, background: 'transparent',
            color: colors.neon, border: `1px solid ${colors.neon}`,
            padding: '8px 14px', fontSize: 12,
          }}
        >
          Quick Add
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(fav.id)}
          style={{
            ...buttonBase, background: 'transparent',
            color: colors.danger, border: `1px solid ${colors.danger}`,
            padding: '8px 10px', fontSize: 12,
          }}
        >
          ✕
        </motion.button>
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
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nutrition_favorites') || '[]'); } catch { return []; }
  });
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

  useEffect(() => {
    localStorage.setItem('nutrition_favorites', JSON.stringify(favorites));
  }, [favorites]);

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
    setFavorites((prev) => [...prev, fav]);
    setFavName('');
    setShowSaveFav(false);
  }, [favName, todayMeals, totals]);

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
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const tabs = [
    { key: 'today', label: 'Today' },
    { key: 'database', label: 'Food Database' },
    { key: 'favorites', label: 'Favorites' },
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
    <div style={{ minHeight: '100vh', background: colors.bg, padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ color: colors.white, fontSize: 22, fontWeight: 700, margin: '0 0 18px' }}
      >
        <span style={{ color: colors.neon }}>Smart</span> Nutrition
      </motion.h1>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              ...buttonBase,
              background: activeTab === t.key ? colors.neon : colors.surface,
              color: activeTab === t.key ? colors.bg : colors.secondary,
              padding: '10px 18px',
              fontSize: 13,
              border: `1px solid ${activeTab === t.key ? colors.neon : '#333'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              background: colors.surface, borderRadius: 20, padding: 24,
              border: '1px solid #222', marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 }}>
                <MacroRing value={totals.calories} max={targets.calories} label="kcal" color={colors.neon} />
                <MacroRing value={totals.protein} max={targets.protein} label="Protein" color="#6EC6FF" />
                <MacroRing value={totals.carbs} max={targets.carbs} label="Carbs" color="#FFB74D" />
                <MacroRing value={totals.fat} max={targets.fat} label="Fat" color="#FF8A80" />
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8,
                marginTop: 18, fontSize: 11,
              }}>
                {[
                  { label: 'Calories', current: totals.calories, target: targets.calories, color: colors.neon },
                  { label: 'Protein', current: totals.protein, target: targets.protein, color: '#6EC6FF' },
                  { label: 'Carbs', current: totals.carbs, target: targets.carbs, color: '#FFB74D' },
                  { label: 'Fat', current: totals.fat, target: targets.fat, color: '#FF8A80' },
                ].map((m) => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.secondary }}>{m.label}</div>
                    <div style={{ color: colors.white, fontWeight: 600, fontSize: 13 }}>
                      {Math.max(0, Math.round(m.target - m.current))} left
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ color: colors.white, fontSize: 15, fontWeight: 600, margin: 0 }}>Meals</h3>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setShowSaveFav(true)}
                  disabled={todayMeals.length === 0}
                  style={{
                    ...buttonBase,
                    background: 'transparent',
                    color: colors.neon,
                    border: `1px solid ${colors.neon}`,
                    padding: '6px 12px',
                    fontSize: 11,
                    opacity: todayMeals.length === 0 ? 0.4 : 1,
                  }}
                >
                  Save as Fav
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setTodayMealSelection('all')}
                style={{
                  ...buttonBase,
                  background: todayMealSelection === 'all' ? '#333' : 'transparent',
                  color: todayMealSelection === 'all' ? colors.white : colors.secondary,
                  border: `1px solid ${todayMealSelection === 'all' ? '#555' : '#333'}`,
                  padding: '6px 12px',
                  fontSize: 11,
                }}
              >
                All ({todayMeals.length})
              </button>
              {mealTypes.map((mt) => (
                <button
                  key={mt}
                  onClick={() => setTodayMealSelection(mt)}
                  style={{
                    ...buttonBase,
                    background: todayMealSelection === mt ? '#333' : 'transparent',
                    color: todayMealSelection === mt ? colors.white : colors.secondary,
                    border: `1px solid ${todayMealSelection === mt ? '#555' : '#333'}`,
                    padding: '6px 12px',
                    fontSize: 11,
                  }}
                >
                  {mt} ({(groupedMeals[mt] || []).length})
                </button>
              ))}
            </div>

            <AnimatePresence>
              {filteredMeals.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: colors.surface, borderRadius: 16, padding: 40,
                    textAlign: 'center', border: '1px solid #222',
                  }}
                >
                  <div style={{ color: colors.secondary, fontSize: 14, marginBottom: 6 }}>No meals logged yet</div>
                  <div style={{ color: '#555', fontSize: 12 }}>Add food from the Food Database tab</div>
                </motion.div>
              )}
              {filteredMeals.map((meal) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  style={{
                    background: colors.card, borderRadius: 12, padding: '12px 16px',
                    marginBottom: 8, display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', border: '1px solid #222',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, color: colors.neon, fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {meal.meal}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.white, marginBottom: 2 }}>
                      {meal.food} {meal.grams ? `(${meal.grams}g)` : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: colors.secondary }}>
                      <span>{meal.calories} kcal</span>
                      <span style={{ color: '#6EC6FF' }}>P: {meal.protein}g</span>
                      <span style={{ color: '#FFB74D' }}>C: {meal.carbs}g</span>
                      <span style={{ color: '#FF8A80' }}>F: {meal.fat}g</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleDeleteMeal(meal.id)}
                    style={{
                      ...buttonBase, background: 'transparent',
                      color: '#666', border: 'none', padding: 8, fontSize: 16,
                    }}
                  >
                    ✕
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('database')}
                style={{
                  ...buttonBase,
                  background: colors.neon, color: colors.bg,
                  padding: '14px 0', fontSize: 14, flex: 1,
                }}
              >
                + Add Food
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeTab === 'database' && (
          <motion.div
            key="database"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <input
                type="text"
                placeholder="Search food..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', background: colors.surface,
                  border: '1px solid #333', borderRadius: 12,
                  color: colors.white, padding: '14px 16px 14px 42px',
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.neon; }}
                onBlur={(e) => { e.target.style.borderColor = '#333'; }}
              />
              <svg
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={colors.secondary} strokeWidth="2" strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {search && (
                <button
                  onClick={() => { setSearch(''); setUsdaResults([]); }}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: colors.secondary, cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {search.trim().length >= 2 && usdaResults.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 11, color: colors.neon, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{
                    background: colors.neon, color: colors.bg,
                    padding: '2px 6px', borderRadius: 4, fontSize: 9,
                  }}>
                    USDA
                  </span>
                  API Results
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {usdaResults.map((food) => (
                    <FoodCard key={food.id} food={food} onAdd={setModalFood} compact />
                  ))}
                </div>
              </div>
            )}

            {loadingUsda && (
              <div style={{ textAlign: 'center', padding: 16, color: colors.secondary, fontSize: 12 }}>
                Searching USDA database...
              </div>
            )}

            <div style={{
              fontSize: 11, color: colors.secondary, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
            }}>
              Built-in Database ({filteredDb.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredDb.map((food) => (
                <FoodCard key={food.id} food={food} onAdd={setModalFood} />
              ))}
            </div>
            {filteredDb.length === 0 && search.trim() && (
              <div style={{
                textAlign: 'center', padding: 30, color: colors.secondary, fontSize: 13,
              }}>
                No foods match "{search}"
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div
            key="favorites"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {showSaveFav && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  background: colors.surface, borderRadius: 16, padding: 20,
                  marginBottom: 16, border: `1px solid ${colors.neon}`,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.white, marginBottom: 10 }}>
                  Save Today's Meals as Favorite
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Favorite name..."
                    value={favName}
                    onChange={(e) => setFavName(e.target.value)}
                    style={{
                      flex: 1, background: colors.card, border: '1px solid #333',
                      borderRadius: 8, color: colors.white, padding: '10px 14px',
                      fontSize: 13, outline: 'none',
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveFavorite(); }}
                  />
                  <button
                    onClick={handleSaveFavorite}
                    disabled={!favName.trim()}
                    style={{
                      ...buttonBase, background: colors.neon, color: colors.bg,
                      padding: '10px 18px', fontSize: 12, opacity: favName.trim() ? 1 : 0.5,
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowSaveFav(false); setFavName(''); }}
                    style={{
                      ...buttonBase, background: colors.card, color: colors.secondary,
                      border: '1px solid #333', padding: '10px 14px', fontSize: 12,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {favorites.length === 0 ? (
              <div style={{
                background: colors.surface, borderRadius: 20, padding: 40,
                textAlign: 'center', border: '1px solid #222',
              }}>
                <div style={{ color: colors.secondary, fontSize: 14, marginBottom: 6 }}>No favorites yet</div>
                <div style={{ color: '#555', fontSize: 12, marginBottom: 16 }}>
                  Log meals today, then save them as a favorite
                </div>
                <button
                  onClick={() => { setActiveTab('today'); }}
                  style={{
                    ...buttonBase, background: 'transparent',
                    color: colors.neon, border: `1px solid ${colors.neon}`,
                    padding: '10px 20px', fontSize: 12,
                  }}
                >
                  Go to Today
                </button>
              </div>
            ) : (
              favorites.map((fav) => (
                <FavoriteCard
                  key={fav.id}
                  fav={fav}
                  onAdd={handleQuickAddFav}
                  onRemove={handleRemoveFavorite}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalFood && (
          <AddMealModal
            food={modalFood}
            onSave={handleAddFood}
            onClose={() => setModalFood(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
