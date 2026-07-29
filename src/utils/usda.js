export const USDA_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USDA_API_KEY) || "DEMO_KEY";
export const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

const _searchCache = new Map();
let _debounceTimer = null;

export const usdaSearch = async (query) => {
  const key = query.trim().toLowerCase();
  if (_searchCache.has(key)) return _searchCache.get(key);
  const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(key)}&pageSize=10&api_key=${USDA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA API error ${res.status}`);
  const data = await res.json();
  const results = (data.foods || []).map(f => {
    const nutrients = {};
    (f.foodNutrients || []).forEach(n => { nutrients[n.nutrientName] = n.value; });
    return {
      fdcId: f.fdcId, name: f.description, brand: f.brandOwner || null,
      category: f.foodCategory || "", servingSize: 100, servingUnit: "g",
      calories: nutrients["Energy"] || 0, protein: nutrients["Protein"] || 0,
      carbs: nutrients["Carbohydrate, by difference"] || 0, fat: nutrients["Total lipid (fat)"] || 0,
      saturatedFat: nutrients["Fatty acids, total saturated"] || 0, fiber: nutrients["Fiber, total dietary"] || 0,
      sugar: nutrients["Sugars, total including NLEA"] || nutrients["Sugars, total"] || 0,
      sodium: nutrients["Sodium, Na"] || 0, potassium: nutrients["Potassium, K"] || 0,
      cholesterol: nutrients["Cholesterol"] || 0,
    };
  });
  _searchCache.set(key, results);
  if (_searchCache.size > 200) { const firstKey = _searchCache.keys().next().value; _searchCache.delete(firstKey); }
  return results;
};

export const usdaDebouncedSearch = (query, cb) => {
  clearTimeout(_debounceTimer);
  if (!query.trim()) { cb([], false, null); return; }
  cb([], true, null);
  _debounceTimer = setTimeout(async () => {
    try { const results = await usdaSearch(query); cb(results, false, null); }
    catch (e) { cb([], false, e.message); }
  }, 400);
};
