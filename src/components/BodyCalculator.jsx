import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Calculator, ChevronDown, SlidersHorizontal, BarChart3, Flame, Lightbulb, PieChart as PieChartIcon } from 'lucide-react';

const tooltipStyle = { background: 'rgba(15,15,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 };

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)', multiplier: 1.2 },
  { value: 'light', label: 'Lightly Active (1-3 days/week)', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately Active (3-5 days/week)', multiplier: 1.55 },
  { value: 'active', label: 'Active (6-7 days/week)', multiplier: 1.725 },
  { value: 'very_active', label: 'Very Active (hard exercise daily)', multiplier: 1.9 },
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const goalOptions = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'bulking', label: 'Bulking (+500 kcal)' },
  { value: 'cutting', label: 'Cutting (-500 kcal)' },
];

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#FFB800', bg: 'rgba(255, 184, 0, 0.15)' };
  if (bmi < 25) return { label: 'Normal', color: '#00E676', bg: 'rgba(0, 230, 118, 0.15)' };
  if (bmi < 30) return { label: 'Overweight', color: '#FF6D00', bg: 'rgba(255, 109, 0, 0.15)' };
  return { label: 'Obese', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.15)' };
};

const getBodyFatCategory = (bf, gender) => {
  if (gender === 'male') {
    if (bf < 6) return { label: 'Essential Fat', color: '#FF6D00', bg: 'rgba(255, 109, 0, 0.15)' };
    if (bf < 14) return { label: 'Athletic', color: '#00E676', bg: 'rgba(0, 230, 118, 0.15)' };
    if (bf < 18) return { label: 'Fitness', color: '#C8FF32', bg: 'rgba(198, 255, 0, 0.15)' };
    if (bf < 25) return { label: 'Average', color: '#FFB800', bg: 'rgba(255, 184, 0, 0.15)' };
    return { label: 'Above Average', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.15)' };
  }
  if (bf < 14) return { label: 'Essential Fat', color: '#FF6D00', bg: 'rgba(255, 109, 0, 0.15)' };
  if (bf < 21) return { label: 'Athletic', color: '#00E676', bg: 'rgba(0, 230, 118, 0.15)' };
  if (bf < 25) return { label: 'Fitness', color: '#C8FF32', bg: 'rgba(198, 255, 0, 0.15)' };
  if (bf < 32) return { label: 'Average', color: '#FFB800', bg: 'rgba(255, 184, 0, 0.15)' };
  return { label: 'Above Average', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.15)' };
};

const getRecommendations = (bmi, bodyFat, tdee, gender) => {
  const recs = [];
  if (bmi < 18.5) {
    recs.push({ title: 'Increase Caloric Intake', text: 'Focus on nutrient-dense foods with higher calories. Aim for gradual weight gain of 0.25-0.5 kg per week.' });
    recs.push({ title: 'Strength Training', text: 'Include resistance training to build muscle mass alongside proper nutrition.' });
  } else if (bmi >= 18.5 && bmi < 25) {
    recs.push({ title: 'Maintain Your Weight', text: 'You are in a healthy weight range. Focus on maintaining with balanced nutrition and regular exercise.' });
    recs.push({ title: 'Optimize Body Composition', text: 'Consider strength training to improve muscle-to-fat ratio even within healthy BMI.' });
  } else if (bmi >= 25 && bmi < 30) {
    recs.push({ title: 'Gradual Weight Loss', text: 'Aim for a moderate caloric deficit of 300-500 kcal per day for sustainable weight loss.' });
    recs.push({ title: 'Increase Physical Activity', text: 'Combine cardio and resistance training for optimal fat loss while preserving muscle.' });
  } else {
    recs.push({ title: 'Consult a Professional', text: 'Consider working with a nutritionist or healthcare provider for a personalized plan.' });
    recs.push({ title: 'Start Slowly', text: 'Begin with low-impact exercises and gradually increase intensity. Focus on sustainable habits.' });
  }
  if (bodyFat) {
    if ((gender === 'male' && bodyFat < 10) || (gender === 'female' && bodyFat < 18)) {
      recs.push({ title: 'Body Fat is Low', text: 'Your body fat is quite low. Ensure adequate nutrition to support hormonal health and energy levels.' });
    } else if ((gender === 'male' && bodyFat > 25) || (gender === 'female' && bodyFat > 32)) {
      recs.push({ title: 'Focus on Fat Loss', text: 'Prioritize creating a sustainable caloric deficit while maintaining adequate protein intake.' });
    }
  }
  recs.push({ title: 'Stay Hydrated', text: 'Drink at least 2-3 liters of water daily. Proper hydration supports metabolism and overall health.' });
  recs.push({ title: 'Sleep Quality', text: 'Aim for 7-9 hours of quality sleep. Poor sleep can increase hunger hormones and reduce recovery.' });
  return recs;
};

const getMacros = (calories, goal, gender) => {
  let proteinRatio, carbRatio, fatRatio;
  if (goal === 'bulking') {
    proteinRatio = 0.30;
    carbRatio = 0.45;
    fatRatio = 0.25;
  } else if (goal === 'cutting') {
    proteinRatio = 0.40;
    carbRatio = 0.30;
    fatRatio = 0.30;
  } else {
    proteinRatio = 0.30;
    carbRatio = 0.40;
    fatRatio = 0.30;
  }
  const protein = Math.round((calories * proteinRatio) / 4);
  const carbs = Math.round((calories * carbRatio) / 4);
  const fat = Math.round((calories * fatRatio) / 9);
  return { protein, carbs, fat, proteinRatio, carbRatio, fatRatio };
};

export default function BodyCalculator({ state, dispatch }) {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    neck: '',
    waist: '',
    hip: '',
    activity: 'moderate',
    goal: 'maintenance',
  });
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('bmi');

  useEffect(() => {
    if (state?.profile) {
      setFormData((prev) => ({
        ...prev,
        weight: state.profile.weight || prev.weight,
        height: state.profile.height || prev.height,
        age: state.profile.age || prev.age,
        gender: state.profile.gender || prev.gender,
      }));
    }
  }, [state?.profile]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculate = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseFloat(formData.age);
    const neck = parseFloat(formData.neck);
    const waist = parseFloat(formData.waist);
    const hip = parseFloat(formData.hip);
    const gender = formData.gender;
    const activity = activityLevels.find((a) => a.value === formData.activity);

    if (!weight || !height || !age) return;

    const bmi = weight / Math.pow(height / 100, 2);
    const bmiCategory = getBMICategory(bmi);

    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * activity.multiplier;
    const maintenance = Math.round(tdee);
    const bulking = Math.round(tdee + 500);
    const cutting = Math.round(tdee - 500);

    let bodyFat = null;
    let bodyFatCategory = null;
    if (waist && neck) {
      if (gender === 'male') {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
      } else if (hip) {
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + neck - hip) + 0.22100 * Math.log10(height)) - 450;
      }
      if (bodyFat && !isNaN(bodyFat) && bodyFat > 0) {
        bodyFatCategory = getBodyFatCategory(bodyFat, gender);
      } else {
        bodyFat = null;
      }
    }

    const bmiChartData = [
      { name: 'Underweight', value: Math.min(bmi, 18.5), fill: bmi < 18.5 ? '#FFB800' : '#333333', fullValue: 18.5 },
      { name: 'Normal', value: bmi >= 18.5 && bmi < 25 ? bmi - 18.5 : 0, fill: bmi >= 18.5 && bmi < 25 ? '#00E676' : '#333333', fullValue: 6.5 },
      { name: 'Overweight', value: bmi >= 25 && bmi < 30 ? bmi - 25 : 0, fill: bmi >= 25 && bmi < 30 ? '#FF6D00' : '#333333', fullValue: 5 },
      { name: 'Obese', value: bmi >= 30 ? Math.min(bmi - 30, 15) : 0, fill: bmi >= 30 ? '#FF1744' : '#333333', fullValue: 15 },
    ];

    const goalCalories = formData.goal === 'bulking' ? bulking : formData.goal === 'cutting' ? cutting : maintenance;
    const macros = getMacros(goalCalories, formData.goal, gender);

    const macrosData = [
      { name: 'Protein', value: macros.proteinRatio * 100, fill: '#C8FF32' },
      { name: 'Carbs', value: macros.carbRatio * 100, fill: '#00E676' },
      { name: 'Fat', value: macros.fatRatio * 100, fill: '#FF6D00' },
    ];

    const recs = getRecommendations(bmi, bodyFat, tdee, gender);

    setResults({
      bmi: bmi.toFixed(1),
      bmiCategory,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      maintenance,
      bulking,
      cutting,
      bodyFat: bodyFat ? bodyFat.toFixed(1) : null,
      bodyFatCategory,
      macros,
      bmiChartData,
      macrosData,
      recs,
    });
  };

  const handleSave = () => {
    if (results && dispatch) {
      dispatch({
        type: 'SAVE_BODY_RESULTS',
        payload: {
          ...results,
          formData,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  const renderBMIGauge = () => {
    if (!results) return null;
    const bmi = parseFloat(results.bmi);
    const minBMI = 12;
    const maxBMI = 40;
    const percentage = Math.min(Math.max(((bmi - minBMI) / (maxBMI - minBMI)) * 100, 0), 100);

    return (
      <div style={{ position: 'relative', width: '100%', height: '24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginTop: '12px' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', backgroundColor: 'rgba(255, 184, 0, 0.3)', borderRadius: '12px 0 0 12px' }} />
        <div style={{ position: 'absolute', left: '30%', top: 0, bottom: 0, width: '21.4%', backgroundColor: 'rgba(0, 230, 118, 0.3)' }} />
        <div style={{ position: 'absolute', left: '51.4%', top: 0, bottom: 0, width: '17.9%', backgroundColor: 'rgba(255, 109, 0, 0.3)' }} />
        <div style={{ position: 'absolute', left: '69.3%', top: 0, bottom: 0, width: '30.7%', backgroundColor: 'rgba(255, 23, 68, 0.3)', borderRadius: '0 12px 12px 0' }} />
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          style={{ position: 'absolute', top: '-4px', width: '4px', height: '32px', backgroundColor: '#FFFFFF', borderRadius: '2px', transform: 'translateX(-50%)', boxShadow: '0 0 8px rgba(255,255,255,0.5)' }}
        />
      </div>
    );
  };

  const renderStatCards = () => {
    if (!results) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rd-nut-stat lime"
        >
          <span className="l">BMI</span>
          <div className="v">{results.bmi}</div>
          <div className="s">
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '999px', fontSize: 11, fontWeight: 700, background: results.bmiCategory.bg, color: results.bmiCategory.color }}>
              {results.bmiCategory.label}
            </span>
          </div>
          {renderBMIGauge()}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            <span>Underweight</span>
            <span>Normal</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rd-nut-stat blue"
        >
          <span className="l">BMR</span>
          <div className="v">{results.bmr}</div>
          <div className="s">kcal/day</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rd-nut-stat orange"
        >
          <span className="l">TDEE</span>
          <div className="v">{results.tdee}</div>
          <div className="s">kcal/day</div>
        </motion.div>

        {results.bodyFat && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rd-nut-stat purple"
          >
            <span className="l">Body Fat</span>
            <div className="v">{results.bodyFat}<span>%</span></div>
            <div className="s">
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '999px', fontSize: 11, fontWeight: 700, background: results.bodyFatCategory.bg, color: results.bodyFatCategory.color }}>
                {results.bodyFatCategory.label}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderTabs = () => {
    if (!results) return null;
    return (
      <div className="rd-card">
        <div className="rd-tabbar" style={{ marginBottom: 16 }}>
          {[
            { key: 'bmi', label: 'BMI Chart', icon: <BarChart3 size={14} /> },
            { key: 'calories', label: 'Calories', icon: <Flame size={14} /> },
            { key: 'macros', label: 'Macros', icon: <PieChartIcon size={14} /> },
            { key: 'recs', label: 'Recommendations', icon: <Lightbulb size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`rd-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'bmi' && (
            <motion.div
              key="bmi"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 14 }}>BMI Category Distribution</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={results.bmiChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A7B1C2' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#A7B1C2' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="fullValue" radius={[4, 4, 0, 0]}>
                    {results.bmiChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} fillOpacity={0.3} />
                    ))}
                  </Bar>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {results.bmiChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {activeTab === 'calories' && (
            <motion.div
              key="calories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rd-stack"
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Maintenance', value: results.maintenance, color: '#C8FF32', desc: 'Maintain current weight' },
                  { label: 'Bulking', value: results.bulking, color: '#5AC8FA', desc: '+500 kcal surplus' },
                  { label: 'Cutting', value: results.cutting, color: '#FF9F0A', desc: '-500 kcal deficit' },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      background: 'linear-gradient(180deg, #1E242E 0%, #0F0F0F 100%)',
                      borderRadius: 14,
                      padding: 20,
                      textAlign: 'center',
                      border: formData.goal === item.label.toLowerCase() ? `1.5px solid ${item.color}` : '1px solid rgba(255,255,255,0.055)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>{item.label}</div>
                    <div className="rd-pr-val" style={{ fontSize: 30, color: item.color, marginTop: 6 }}>
                      {item.value}<span> kcal</span>
                    </div>
                    <div className="rd-count" style={{ marginTop: 5 }}>{item.desc}</div>
                  </motion.div>
                ))}
              </div>
              <table className="rd-table">
                <tbody>
                  <tr>
                    <td>Basal Metabolic Rate (BMR)</td>
                    <td className="num cal" style={{ textAlign: 'right' }}>{results.bmr} kcal</td>
                  </tr>
                  <tr>
                    <td>Total Daily Energy Expenditure (TDEE)</td>
                    <td className="num cal" style={{ textAlign: 'right' }}>{results.tdee} kcal</td>
                  </tr>
                  <tr>
                    <td>Activity Level</td>
                    <td className="num cal" style={{ textAlign: 'right' }}>{activityLevels.find((a) => a.value === formData.activity)?.label}</td>
                  </tr>
                  <tr>
                    <td>Selected Goal Calories</td>
                    <td className="num cal" style={{ textAlign: 'right', color: '#C8FF32' }}>
                      {formData.goal === 'bulking' ? results.bulking : formData.goal === 'cutting' ? results.cutting : results.maintenance} kcal
                    </td>
                  </tr>
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'macros' && (
            <motion.div
              key="macros"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rd-stack"
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={results.macrosData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {results.macrosData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Protein', value: results.macros.protein, ratio: results.macros.proteinRatio, color: '#C8FF32', unit: 'g' },
                  { label: 'Carbs', value: results.macros.carbs, ratio: results.macros.carbRatio, color: '#00E676', unit: 'g' },
                  { label: 'Fat', value: results.macros.fat, ratio: results.macros.fatRatio, color: '#FF6D00', unit: 'g' },
                ].map((macro) => (
                  <div key={macro.label} style={{ background: 'linear-gradient(180deg, #1E242E 0%, #0F0F0F 100%)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>{macro.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: macro.color, fontFamily: "'JetBrains Mono', monospace", marginTop: 5, lineHeight: 1.1 }}>
                      {macro.value}{macro.unit}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{Math.round(macro.ratio * 100)}% of calories</div>
                    <div className="rd-macro-track" style={{ marginTop: 10 }}>
                      <motion.div
                        className="rd-macro-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${macro.ratio * 100}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        style={{ background: macro.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'recs' && (
            <motion.div
              key="recs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rd-stack"
            >
              {results.recs.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  style={{ background: 'linear-gradient(180deg, #1E242E 0%, #0F0F0F 100%)', border: '1px solid rgba(255,255,255,0.055)', borderLeft: '3px solid #C8FF32', borderRadius: 12, padding: '14px 16px' }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#C8FF32', marginBottom: 4 }}>{rec.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{rec.text}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><Calculator size={13} /> Tools</span>
          <h1 className="rd-title">Body Calculator</h1>
          <p className="rd-sub">BMI, BMR, TDEE and macro targets based on your metrics.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rd-card"
      >
        <div className="rd-card-head">
          <div className="rd-card-title">
            <div className="rd-card-title-ico lime"><SlidersHorizontal size={15} /></div>
            <div>
              <div className="rd-card-kicker">Metrics</div>
              <div className="rd-card-name">Input Details</div>
            </div>
          </div>
        </div>
        <div className="rd-form">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
            <div className="rd-field">
              <label>Weight (kg)</label>
              <input
                type="number"
                className="rd-input"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="e.g. 75"
              />
            </div>
            <div className="rd-field">
              <label>Height (cm)</label>
              <input
                type="number"
                className="rd-input"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                placeholder="e.g. 175"
              />
            </div>
            <div className="rd-field">
              <label>Age</label>
              <input
                type="number"
                className="rd-input"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="e.g. 28"
              />
            </div>
            <div className="rd-field">
              <label>Gender</label>
              <div className="rd-select-wrap">
                <select
                  className="rd-select"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  {genderOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </div>
            </div>
            <div className="rd-field">
              <label>Neck Circumference (cm)</label>
              <input
                type="number"
                className="rd-input"
                value={formData.neck}
                onChange={(e) => handleChange('neck', e.target.value)}
                placeholder="e.g. 38"
              />
            </div>
            <div className="rd-field">
              <label>Waist Circumference (cm)</label>
              <input
                type="number"
                className="rd-input"
                value={formData.waist}
                onChange={(e) => handleChange('waist', e.target.value)}
                placeholder="e.g. 82"
              />
            </div>
            {formData.gender === 'female' && (
              <div className="rd-field">
                <label>Hip Circumference (cm)</label>
                <input
                  type="number"
                  className="rd-input"
                  value={formData.hip}
                  onChange={(e) => handleChange('hip', e.target.value)}
                  placeholder="e.g. 98"
                />
              </div>
            )}
            <div className="rd-field">
              <label>Activity Level</label>
              <div className="rd-select-wrap">
                <select
                  className="rd-select"
                  value={formData.activity}
                  onChange={(e) => handleChange('activity', e.target.value)}
                >
                  {activityLevels.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </div>
            </div>
            <div className="rd-field">
              <label>Goal</label>
              <div className="rd-select-wrap">
                <select
                  className="rd-select"
                  value={formData.goal}
                  onChange={(e) => handleChange('goal', e.target.value)}
                >
                  {goalOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </div>
            </div>
          </div>
          <button className="rd-btn-primary" style={{ width: '100%' }} onClick={calculate}>
            Calculate
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ delay: 0.1 }}
            className="rd-stack"
          >
            {renderStatCards()}
            {renderTabs()}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <button className="rd-btn-secondary" onClick={handleSave}>
                Save Results
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
