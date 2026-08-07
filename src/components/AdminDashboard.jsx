import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Activity, TrendingUp, BarChart3, PieChart as PieIcon, Timer, Flame, Trophy, Zap, History } from 'lucide-react';

const ACCENT = '#C8FF32';
const SECONDARY = '#A7B1C2';

const tooltipStyle = {
  background: 'rgba(15,15,15,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  fontSize: 12,
};

const axisTick = { fontSize: 11, fill: '#A7B1C2' };

function getWeekLabel(d) {
  const start = new Date(d);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (dt) => `${dt.getMonth() + 1}/${dt.getDate()}`;
  return `${fmt(start)}-${fmt(end)}`;
}

function getMonthLabel(d) {
  return d.toLocaleString('default', { month: 'short' });
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffDays(a, b) {
  return Math.floor((startOfDay(a) - startOfDay(b)) / 86400000);
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getWorkoutVolume(w) {
  if (!w.exercises || !Array.isArray(w.exercises)) return 0;
  return w.exercises.reduce((sum, ex) => {
    if (!ex.sets || !Array.isArray(ex.sets)) return sum;
    return sum + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0);
  }, 0);
}

function getWorkoutDuration(w) {
  if (w.duration) return w.duration;
  if (w.exercises && w.exercises.length > 0) {
    const last = w.exercises[w.exercises.length - 1];
    if (last.endTime && w.exercises[0].startTime) {
      return Math.round((new Date(last.endTime) - new Date(w.exercises[0].startTime)) / 60000);
    }
  }
  return 0;
}

function getMuscleGroups(w) {
  if (!w.exercises || !Array.isArray(w.exercises)) return [];
  return w.exercises.map(e => e.muscleGroup || e.muscle || e.category).filter(Boolean);
}

export default function AdminDashboard({ state, dispatch }) {
  const workouts = state.workouts || [];
  const nutrition = state.nutrition || [];
  const runs = state.runs || [];
  const personalRecords = state.personalRecords || [];
  const profile = state.profile || {};
  const level = state.level || 1;
  const xp = state.xp || 0;

  const stats = useMemo(() => {
    const now = new Date();
    const memberSince = profile.createdAt ? new Date(profile.createdAt) : null;

    const totalWorkouts = workouts.length;
    const totalRuns = runs.length;
    const totalNutrition = nutrition.length;
    const totalPersonalRecords = personalRecords.length;

    const avgWorkoutDuration = workouts.length > 0
      ? Math.round(workouts.reduce((s, w) => s + getWorkoutDuration(w), 0) / workouts.length)
      : 0;

    const allMuscles = workouts.flatMap(getMuscleGroups);
    const muscleCount = {};
    allMuscles.forEach(m => { muscleCount[m] = (muscleCount[m] || 0) + 1; });
    const mostTrained = Object.entries(muscleCount).sort((a, b) => b[1] - a[1])[0];

    const totalCalories = nutrition.reduce((s, n) => s + (n.totalCalories || n.calories || 0), 0);
    const nutritionDays = new Set(nutrition.map(n => startOfDay(new Date(n.date || n.createdAt)).toDateString()));
    const avgCaloriesPerDay = nutritionDays.size > 0 ? Math.round(totalCalories / nutritionDays.size) : 0;

    const totalDistance = runs.reduce((s, r) => s + (r.distance || 0), 0);
    const longestRun = runs.length > 0 ? Math.max(...runs.map(r => r.distance || 0)) : 0;

    const bestVolume = workouts.length > 0 ? Math.max(...workouts.map(getWorkoutVolume)) : 0;

    let bestEst1RM = 0;
    workouts.forEach(w => {
      if (!w.exercises || !Array.isArray(w.exercises)) return;
      w.exercises.forEach(ex => {
        if (!ex.sets || !Array.isArray(ex.sets)) return;
        ex.sets.forEach(set => {
          const w2 = set.weight || 0;
          const r = set.reps || 0;
          if (r > 0 && w2 > 0) {
            const est = Math.round(w2 * (1 + r / 30));
            if (est > bestEst1RM) bestEst1RM = est;
          }
        });
      });
    });

    let streak = 0;
    if (workouts.length > 0 || runs.length > 0 || nutrition.length > 0) {
      const allDates = [
        ...workouts.map(w => startOfDay(new Date(w.date || w.createdAt))),
        ...runs.map(r => startOfDay(new Date(r.date || r.createdAt))),
        ...nutrition.map(n => startOfDay(new Date(n.date || n.createdAt))),
      ].sort((a, b) => b - a);

      const uniqueDays = [...new Set(allDates.map(d => d.toDateString()))].map(d => new Date(d));
      if (uniqueDays.length > 0) {
        const today = startOfDay(now);
        const latestDay = uniqueDays[0];
        if (diffDays(today, latestDay) <= 1) {
          streak = 1;
          for (let i = 1; i < uniqueDays.length; i++) {
            if (diffDays(uniqueDays[i - 1], uniqueDays[i]) === 1) {
              streak++;
            } else {
              break;
            }
          }
        }
      }
    }

    const longestStreakEver = streak;

    const weekCounts = {};
    for (let i = 11; i >= 0; i--) {
      const weekStart = addDays(now, -i * 7 - now.getDay());
      const label = getWeekLabel(weekStart);
      weekCounts[label] = { label, count: 0 };
    }
    workouts.forEach(w => {
      const wd = new Date(w.date || w.createdAt);
      for (const key of Object.keys(weekCounts)) {
        const parts = key.split('-')[0].split('/');
        const ws = new Date(wd.getFullYear(), parseInt(parts[0]) - 1, parseInt(parts[1]));
        const we = new Date(ws);
        we.setDate(we.getDate() + 6);
        if (wd >= ws && wd <= we) {
          weekCounts[key].count++;
          break;
        }
      }
    });
    const weeklyData = Object.values(weekCounts);

    const monthDistances = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = getMonthLabel(d);
      monthDistances[label] = { label, distance: 0 };
    }
    runs.forEach(r => {
      const rd = new Date(r.date || r.createdAt);
      const label = getMonthLabel(rd);
      if (monthDistances[label]) {
        monthDistances[label].distance += r.distance || 0;
      }
    });
    const monthlyRunData = Object.values(monthDistances).map(d => ({ ...d, distance: Math.round(d.distance * 100) / 100 }));

    const last30 = [];
    for (let i = 29; i >= 0; i--) {
      const d = addDays(now, -i);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      last30.push({ date: key, volume: 0 });
    }
    workouts.forEach(w => {
      const wd = startOfDay(new Date(w.date || w.createdAt));
      const key = `${wd.getMonth() + 1}/${wd.getDate()}`;
      const entry = last30.find(e => e.date === key);
      if (entry) entry.volume += getWorkoutVolume(w);
    });
    const volumeTrend = last30.map(d => ({ ...d, volume: Math.round(d.volume) }));

    const daysWithMeals = new Set(nutrition.map(n => startOfDay(new Date(n.date || n.createdAt)).toDateString()));
    const last90Days = Math.min(90, memberSince ? diffDays(now, memberSince) : 90);
    const daysWithFood = [...daysWithMeals].filter(dateStr => {
      const d = new Date(dateStr);
      return diffDays(now, d) <= last90Days;
    }).length;
    const daysWithoutFood = Math.max(0, last90Days - daysWithFood);
    const pieData = [
      { name: 'Logged', value: daysWithFood, color: ACCENT },
      { name: 'Not Logged', value: daysWithoutFood, color: '#333333' },
    ];

    return {
      totalWorkouts,
      totalRuns,
      totalNutrition,
      totalPersonalRecords,
      memberSince,
      level,
      xp,
      avgWorkoutDuration,
      mostTrained: mostTrained ? mostTrained[0] : 'N/A',
      avgCaloriesPerDay,
      totalDistance: Math.round(totalDistance * 100) / 100,
      longestRun,
      bestVolume,
      bestEst1RM,
      longestStreakEver,
      streak,
      weeklyData,
      monthlyRunData,
      volumeTrend,
      pieData,
    };
  }, [workouts, runs, nutrition, personalRecords, profile, level, xp]);

  const recentActivity = useMemo(() => {
    const items = [];
    workouts.forEach(w => {
      items.push({
        type: 'Workout',
        title: w.name || w.type || 'Workout',
        date: new Date(w.date || w.createdAt),
        detail: `${getWorkoutVolume(w)} vol · ${getWorkoutDuration(w)} min`,
      });
    });
    runs.forEach(r => {
      items.push({
        type: 'Run',
        title: r.name || 'Running Session',
        date: new Date(r.date || r.createdAt),
        detail: `${r.distance || 0} km · ${r.duration || 0} min`,
      });
    });
    nutrition.forEach(n => {
      items.push({
        type: 'Meal',
        title: n.name || n.mealType || 'Meal',
        date: new Date(n.date || n.createdAt),
        detail: `${n.totalCalories || n.calories || 0} kcal`,
      });
    });
    return items.sort((a, b) => b.date - a.date).slice(0, 10);
  }, [workouts, runs, nutrition]);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
    }),
  };

  const typeColors = { Workout: ACCENT, Run: '#00D4FF', Meal: '#FF6B6B' };

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><BarChart3 size={13} /> Admin</span>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rd-title"
          >
            Analytics Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rd-sub"
          >
            Your fitness overview and performance metrics
          </motion.p>
        </div>
      </div>

      <div className="rd-nut-stats">
        {[
          { label: 'Total Workouts', value: stats.totalWorkouts, cls: 'lime' },
          { label: 'Running Sessions', value: stats.totalRuns, cls: 'blue' },
          { label: 'Nutrition Entries', value: stats.totalNutrition, cls: 'orange' },
          { label: 'Member Since', value: stats.memberSince ? stats.memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A', cls: 'purple' },
          { label: 'Current Level', value: `Lv.${stats.level}`, sub: `${stats.xp.toLocaleString()} XP`, cls: 'lime' },
          { label: 'Current Streak', value: `${stats.streak}d`, cls: stats.streak > 0 ? 'green' : '' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className={`rd-nut-stat ${card.cls}`}
          >
            <div className="l">{card.label}</div>
            <div className="v">{card.value}</div>
            {card.sub && <div className="s">{card.sub}</div>}
          </motion.div>
        ))}
      </div>

      <div className="rd-grid">
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="rd-span-3 rd-card" style={{ padding: 20 }}>
          <div className="rd-card-head" style={{ marginBottom: 12 }}>
            <div className="rd-card-title">
              <div className="rd-card-title-ico lime"><BarChart3 size={15} /></div>
              <div>
                <div className="rd-card-kicker">Charts</div>
                <div className="rd-card-name">Workout Frequency (Last 12 Weeks)</div>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={axisTick} interval={1} angle={-30} textAnchor="end" height={50} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(200,255,50,0.05)' }} />
              <Bar dataKey="count" name="Workouts" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp} className="rd-span-3 rd-card" style={{ padding: 20 }}>
          <div className="rd-card-head" style={{ marginBottom: 12 }}>
            <div className="rd-card-title">
              <div className="rd-card-title-ico blue"><Activity size={15} /></div>
              <div>
                <div className="rd-card-kicker">Charts</div>
                <div className="rd-card-name">Running Distance (Last 6 Months)</div>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.monthlyRunData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="distance" name="Distance (km)" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div custom={8} initial="hidden" animate="visible" variants={fadeUp} className="rd-span-3 rd-card" style={{ padding: 20 }}>
          <div className="rd-card-head" style={{ marginBottom: 12 }}>
            <div className="rd-card-title">
              <div className="rd-card-title-ico orange"><PieIcon size={15} /></div>
              <div>
                <div className="rd-card-kicker">Charts</div>
                <div className="rd-card-name">Nutrition Adherence</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, gap: 24 }}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.pieData.map((entry) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: entry.color }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{entry.name}: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{entry.value}d</span></span>
                </div>
              ))}
              {stats.pieData[0] && (
                <span style={{ fontSize: 20, fontWeight: 700, color: ACCENT }}>
                  {stats.pieData[0].value + stats.pieData[1].value > 0
                    ? Math.round((stats.pieData[0].value / (stats.pieData[0].value + stats.pieData[1].value)) * 100)
                    : 0}%
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div custom={9} initial="hidden" animate="visible" variants={fadeUp} className="rd-span-3 rd-card" style={{ padding: 20 }}>
          <div className="rd-card-head" style={{ marginBottom: 12 }}>
            <div className="rd-card-title">
              <div className="rd-card-title-ico lime"><TrendingUp size={15} /></div>
              <div>
                <div className="rd-card-kicker">Charts</div>
                <div className="rd-card-name">Workout Volume Trend (Last 30 Days)</div>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.volumeTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={axisTick} interval={4} angle={-30} textAnchor="end" height={50} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="volume" name="Volume (kg×reps)" stroke={ACCENT} strokeWidth={2} dot={false} activeDot={{ r: 5, fill: ACCENT }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="rd-nut-stats">
        {[
          { label: 'Avg Workout Duration', value: `${stats.avgWorkoutDuration} min` },
          { label: 'Most Trained Group', value: stats.mostTrained },
          { label: 'Avg Calories / Day', value: `${stats.avgCaloriesPerDay.toLocaleString()} kcal` },
          { label: 'Total Distance Run', value: `${stats.totalDistance} km` },
          { label: 'Longest Single Run', value: `${stats.longestRun} km` },
          { label: 'Personal Records', value: stats.totalPersonalRecords },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            custom={10 + i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="rd-nut-stat lime"
          >
            <div className="l">{card.label}</div>
            <div className="v">{card.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="rd-nut-stats">
        {[
          { label: 'Best Workout Volume', value: stats.bestVolume.toLocaleString(), unit: 'kg' },
          { label: 'Longest Run', value: stats.longestRun, unit: 'km' },
          { label: 'Best Est. 1RM', value: stats.bestEst1RM.toLocaleString(), unit: 'kg' },
          { label: 'Longest Streak', value: stats.longestStreakEver, unit: 'days' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            custom={16 + i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="rd-nut-stat"
            style={{ borderLeft: `3px solid ${ACCENT}` }}
          >
            <div className="l">{card.label}</div>
            <div className="v">{card.value}<span> {card.unit}</span></div>
          </motion.div>
        ))}
      </div>

      <motion.div
        custom={20}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rd-card"
      >
        <div className="rd-card-head">
          <div className="rd-card-title">
            <div className="rd-card-title-ico purple"><History size={15} /></div>
            <div>
              <div className="rd-card-kicker">Activity</div>
              <div className="rd-card-name">Recent Activity</div>
            </div>
          </div>
          {recentActivity.length > 0 && <span className="rd-count"><b>{recentActivity.length}</b> recent</span>}
        </div>
        {recentActivity.length === 0 ? (
          <div className="rd-empty" style={{ padding: 28 }}>
            <Activity size={26} style={{ color: 'rgba(255,255,255,0.25)', marginBottom: 2 }} />
            <div className="rd-empty-title">No activity recorded yet</div>
            <div className="rd-empty-sub">Complete workouts, runs, or log meals to see activity here.</div>
          </div>
        ) : (
          <div>
            {recentActivity.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '11px 0',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[item.type] || SECONDARY, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{item.detail}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span
                    className="rd-ex-tag"
                    style={{
                      background: `${typeColors[item.type] || SECONDARY}1a`,
                      color: typeColors[item.type] || SECONDARY,
                      borderColor: `${typeColors[item.type] || SECONDARY}33`,
                    }}
                  >
                    {item.type}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', minWidth: 70, textAlign: 'right' }}>
                    {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
