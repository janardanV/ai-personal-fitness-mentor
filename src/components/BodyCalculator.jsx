import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const styles = {
  container: {
    backgroundColor: '#0A0A0A',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
  },
  header: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#22C55E',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#151515',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    border: '1px solid #252525',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#A0A0A0',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#1E1E1E',
    border: '1px solid #333333',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#1E1E1E',
    border: '1px solid #333333',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '16px',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    backgroundColor: '#22C55E',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#22C55E',
    lineHeight: '1.2',
  },
  statLabel: {
    fontSize: '14px',
    color: '#A0A0A0',
    marginTop: '4px',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px',
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #252525',
  },
  resultLabel: {
    fontSize: '14px',
    color: '#A0A0A0',
  },
  resultValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  macroBar: {
    height: '8px',
    borderRadius: '4px',
    marginTop: '8px',
  },
  recommendation: {
    backgroundColor: '#1E1E1E',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    borderLeft: '3px solid #22C55E',
  },
  recoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: '4px',
  },
  recoText: {
    fontSize: '13px',
    color: '#A0A0A0',
    lineHeight: '1.5',
  },
  saveButton: {
    padding: '12px 24px',
    backgroundColor: '#252525',
    color: '#22C55E',
    border: '1px solid #22C55E',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #333333',
    backgroundColor: 'transparent',
    color: '#A0A0A0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  tabActive: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #22C55E',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: '#22C55E',
    fontSize: '14px',
    fontWeight: '500',
  },
  progressRing: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '12px',
    marginTop: '20px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#252525',
    margin: '16px 0',
  },
};

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
    if (bf < 18) return { label: 'Fitness', color: '#22C55E', bg: 'rgba(255, 255, 255, 0.06)' };
    if (bf < 25) return { label: 'Average', color: '#FFB800', bg: 'rgba(255, 184, 0, 0.15)' };
    return { label: 'Above Average', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.15)' };
  }
  if (bf < 14) return { label: 'Essential Fat', color: '#FF6D00', bg: 'rgba(255, 109, 0, 0.15)' };
  if (bf < 21) return { label: 'Athletic', color: '#00E676', bg: 'rgba(0, 230, 118, 0.15)' };
  if (bf < 25) return { label: 'Fitness', color: '#22C55E', bg: 'rgba(255, 255, 255, 0.06)' };
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
      { name: 'Protein', value: macros.proteinRatio * 100, fill: '#22C55E' },
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
      <div style={{ position: 'relative', width: '100%', height: '24px', backgroundColor: '#1E1E1E', borderRadius: '12px', overflow: 'hidden', marginTop: '12px' }}>
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

  return (
    <div style={styles.container}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        Body Calculator
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={styles.card}
      >
        <h2 style={styles.cardTitle}>Input Details</h2>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Weight (kg)</label>
            <input
              type="number"
              style={styles.input}
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              placeholder="e.g. 75"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Height (cm)</label>
            <input
              type="number"
              style={styles.input}
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
              placeholder="e.g. 175"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Age</label>
            <input
              type="number"
              style={styles.input}
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="e.g. 28"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Gender</label>
            <select
              style={styles.select}
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              {genderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Neck Circumference (cm)</label>
            <input
              type="number"
              style={styles.input}
              value={formData.neck}
              onChange={(e) => handleChange('neck', e.target.value)}
              placeholder="e.g. 38"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Waist Circumference (cm)</label>
            <input
              type="number"
              style={styles.input}
              value={formData.waist}
              onChange={(e) => handleChange('waist', e.target.value)}
              placeholder="e.g. 82"
            />
          </div>
          {formData.gender === 'female' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Hip Circumference (cm)</label>
              <input
                type="number"
                style={styles.input}
                value={formData.hip}
                onChange={(e) => handleChange('hip', e.target.value)}
                placeholder="e.g. 98"
              />
            </div>
          )}
          <div style={styles.formGroup}>
            <label style={styles.label}>Activity Level</label>
            <select
              style={styles.select}
              value={formData.activity}
              onChange={(e) => handleChange('activity', e.target.value)}
            >
              {activityLevels.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Goal</label>
            <select
              style={styles.select}
              value={formData.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
            >
              {goalOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={styles.button}
          onClick={calculate}
        >
          Calculate
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
          >
            <div style={styles.grid}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={styles.card}
              >
                <div style={styles.statLabel}>BMI</div>
                <div style={styles.statValue}>{results.bmi}</div>
                <div style={{ ...styles.categoryBadge, backgroundColor: results.bmiCategory.bg, color: results.bmiCategory.color }}>
                  {results.bmiCategory.label}
                </div>
                {renderBMIGauge()}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#A0A0A0' }}>
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                style={styles.card}
              >
                <div style={styles.statLabel}>BMR</div>
                <div style={styles.statValue}>{results.bmr}</div>
                <div style={styles.statLabel}>kcal/day</div>
                <div style={styles.divider} />
                <div style={styles.statLabel}>TDEE</div>
                <div style={{ ...styles.statValue, fontSize: '28px' }}>{results.tdee}</div>
                <div style={styles.statLabel}>kcal/day</div>
              </motion.div>

              {results.bodyFat && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  style={styles.card}
                >
                  <div style={styles.statLabel}>Body Fat</div>
                  <div style={styles.statValue}>{results.bodyFat}%</div>
                  <div style={{ ...styles.categoryBadge, backgroundColor: results.bodyFatCategory.bg, color: results.bodyFatCategory.color }}>
                    {results.bodyFatCategory.label}
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={styles.card}
            >
              <div style={styles.tabContainer}>
                {[
                  { key: 'bmi', label: 'BMI Chart' },
                  { key: 'calories', label: 'Calories' },
                  { key: 'macros', label: 'Macros' },
                  { key: 'recs', label: 'Recommendations' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    style={activeTab === tab.key ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab(tab.key)}
                  >
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
                    <h3 style={styles.sectionTitle}>BMI Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={results.bmiChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
                        <XAxis dataKey="name" stroke="#A0A0A0" fontSize={12} />
                        <YAxis stroke="#A0A0A0" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333333', borderRadius: '8px', color: '#FFFFFF' }}
                        />
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
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      {[
                        { label: 'Maintenance', value: results.maintenance, color: '#22C55E', desc: 'Maintain current weight' },
                        { label: 'Bulking', value: results.bulking, color: '#00E676', desc: '+500 kcal surplus' },
                        { label: 'Cutting', value: results.cutting, color: '#FF6D00', desc: '-500 kcal deficit' },
                      ].map((item) => (
                        <motion.div
                          key={item.label}
                          whileHover={{ scale: 1.02 }}
                          style={{
                            backgroundColor: '#1E1E1E',
                            borderRadius: '12px',
                            padding: '20px',
                            border: formData.goal === item.label.toLowerCase() ? `2px solid ${item.color}` : '1px solid #333333',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '14px', color: '#A0A0A0', marginBottom: '8px' }}>{item.label}</div>
                          <div style={{ fontSize: '32px', fontWeight: '700', color: item.color }}>{item.value}</div>
                          <div style={{ fontSize: '12px', color: '#A0A0A0', marginTop: '4px' }}>kcal/day</div>
                          <div style={{ fontSize: '12px', color: '#666666', marginTop: '8px' }}>{item.desc}</div>
                        </motion.div>
                      ))}
                    </div>
                    <div style={{ ...styles.card, marginTop: '16px', backgroundColor: '#1E1E1E' }}>
                      <div style={styles.resultRow}>
                        <span style={styles.resultLabel}>Basal Metabolic Rate (BMR)</span>
                        <span style={styles.resultValue}>{results.bmr} kcal</span>
                      </div>
                      <div style={styles.resultRow}>
                        <span style={styles.resultLabel}>Total Daily Energy Expenditure (TDEE)</span>
                        <span style={styles.resultValue}>{results.tdee} kcal</span>
                      </div>
                      <div style={styles.resultRow}>
                        <span style={styles.resultLabel}>Activity Level</span>
                        <span style={styles.resultValue}>{activityLevels.find((a) => a.value === formData.activity)?.label}</span>
                      </div>
                      <div style={{ ...styles.resultRow, borderBottom: 'none' }}>
                        <span style={styles.resultLabel}>Selected Goal Calories</span>
                        <span style={{ ...styles.resultValue, color: '#22C55E' }}>
                          {formData.goal === 'bulking' ? results.bulking : formData.goal === 'cutting' ? results.cutting : results.maintenance} kcal
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'macros' && (
                  <motion.div
                    key="macros"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
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
                            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333333', borderRadius: '8px', color: '#FFFFFF' }}
                            formatter={(value) => [`${value}%`]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
                      {[
                        { label: 'Protein', value: results.macros.protein, ratio: results.macros.proteinRatio, color: '#22C55E', unit: 'g' },
                        { label: 'Carbs', value: results.macros.carbs, ratio: results.macros.carbRatio, color: '#00E676', unit: 'g' },
                        { label: 'Fat', value: results.macros.fat, ratio: results.macros.fatRatio, color: '#FF6D00', unit: 'g' },
                      ].map((macro) => (
                        <div key={macro.label} style={{ backgroundColor: '#1E1E1E', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '4px' }}>{macro.label}</div>
                          <div style={{ fontSize: '28px', fontWeight: '700', color: macro.color }}>{macro.value}{macro.unit}</div>
                          <div style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>{Math.round(macro.ratio * 100)}% of calories</div>
                          <div style={{ ...styles.macroBar, backgroundColor: '#252525' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${macro.ratio * 100}%` }}
                              transition={{ delay: 0.5, duration: 0.8 }}
                              style={{ height: '100%', backgroundColor: macro.color, borderRadius: '4px' }}
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
                  >
                    {results.recs.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={styles.recommendation}
                      >
                        <div style={styles.recoTitle}>{rec.title}</div>
                        <div style={styles.recoText}>{rec.text}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ textAlign: 'center', marginTop: '16px' }}
            >
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#1E1E1E' }}
                whileTap={{ scale: 0.95 }}
                style={styles.saveButton}
                onClick={handleSave}
              >
                Save Results
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
