import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Trophy, Zap, Medal, Flame, Dumbbell, Lock, Check } from 'lucide-react';

const CATEGORIES = ['All', 'Workout', 'Nutrition', 'Running', 'Social', 'Special'];

const DAY_MS = 86400000;

const ACHIEVEMENTS = [
  { id: 'first_workout', category: 'Workout', icon: '🏋️', title: 'First Workout', description: 'Complete your first workout', xp: 50 },
  { id: 'week_streak', category: 'Workout', icon: '🔥', title: 'Week Warrior', description: '7 consecutive active days', xp: 100 },
  { id: 'month_streak', category: 'Workout', icon: '💎', title: 'Monthly Master', description: '30 consecutive active days', xp: 500 },
  { id: 'ten_workouts', category: 'Workout', icon: '💪', title: 'Getting Stronger', description: 'Complete 10 workouts', xp: 100 },
  { id: 'fifty_workouts', category: 'Workout', icon: '🦾', title: 'Iron Will', description: 'Complete 50 workouts', xp: 500 },
  { id: 'hundred_workouts', category: 'Workout', icon: '🏆', title: 'Century Club', description: 'Complete 100 workouts', xp: 1000 },
  { id: 'volume_1000', category: 'Workout', icon: '⚡', title: 'Power Lifter', description: '1000kg volume in single session', xp: 75 },
  { id: 'volume_5000', category: 'Workout', icon: '🌋', title: 'Volcanic', description: '5000kg volume in single session', xp: 200 },
  { id: 'early_bird', category: 'Workout', icon: '🌅', title: 'Early Bird', description: 'Workout before 7 AM', xp: 75 },
  { id: 'night_owl', category: 'Workout', icon: '🦉', title: 'Night Owl', description: 'Workout after 10 PM', xp: 75 },
  { id: 'first_meal', category: 'Nutrition', icon: '🥗', title: 'First Bite', description: 'Log your first meal', xp: 25 },
  { id: 'nutrition_week', category: 'Nutrition', icon: '📊', title: 'Tracked Week', description: '7 days of nutrition tracking', xp: 100 },
  { id: 'protein_hit', category: 'Nutrition', icon: '🥩', title: 'Protein Power', description: 'Hit protein target in a day', xp: 50 },
  { id: 'calorie_master', category: 'Nutrition', icon: '🎯', title: 'Calorie Master', description: 'Stay within 100 cal of target for 7 days', xp: 150 },
  { id: 'first_run', category: 'Running', icon: '🏃', title: 'First Steps', description: 'Complete your first run', xp: 25 },
  { id: 'run_5k', category: 'Running', icon: '🏅', title: '5K Finisher', description: 'Run 5 km in a single session', xp: 100 },
  { id: 'run_10k', category: 'Running', icon: '🥇', title: '10K Champion', description: 'Run 10 km in a single session', xp: 250 },
  { id: 'total_100km', category: 'Running', icon: '🛣️', title: 'Road Runner', description: 'Run 100 km total', xp: 200 },
  { id: 'total_500km', category: 'Running', icon: '🌍', title: 'Globe Trotter', description: 'Run 500 km total', xp: 1000 },
  { id: 'speed_demon', category: 'Running', icon: '💨', title: 'Speed Demon', description: 'Pace faster than 4:30/km', xp: 300 },
  { id: 'level_5', category: 'Special', icon: '⭐', title: 'Rising Star', description: 'Reach Level 5', xp: 100 },
  { id: 'level_10', category: 'Special', icon: '🌟', title: 'Superstar', description: 'Reach Level 10', xp: 250 },
  { id: 'level_25', category: 'Special', icon: '✨', title: 'Legend', description: 'Reach Level 25', xp: 500 },
  { id: 'all_rounder', category: 'Special', icon: '🎖️', title: 'All-Rounder', description: 'Earn badges in 3+ categories', xp: 200 },
];

function calculateStreaks(workouts, runs) {
  const allDates = [
    ...(workouts || []).map(w => w.date),
    ...(runs || []).map(r => r.date),
  ];

  if (!allDates.length) return { current: 0, longest: 0 };

  const uniqueDays = [...new Set(allDates.map(d =>
    Math.floor(new Date(d).getTime() / DAY_MS)
  ))].sort((a, b) => b - a);

  const today = Math.floor(Date.now() / DAY_MS);

  let current = 0;
  let expected = today;

  for (const day of uniqueDays) {
    if (day === expected) {
      current++;
      expected--;
    } else if (current === 0 && day === today - 1) {
      expected = day;
      current = 1;
    } else {
      break;
    }
  }

  let longest = 0;
  let temp = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i - 1] - uniqueDays[i] === 1) {
      temp++;
    } else {
      longest = Math.max(longest, temp);
      temp = 1;
    }
  }
  longest = Math.max(longest, temp, current);

  return { current, longest };
}

function getMaxWorkoutVolume(workouts) {
  return Math.max(0, ...(workouts || []).map(w =>
    (w.exercises || []).reduce((sum, e) =>
      sum + (e.sets || []).reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0), 0
    )
  ));
}

function checkAchievement(id, state, streaks) {
  const workouts = state?.workouts || [];
  const nutrition = state?.nutrition || [];
  const runs = state?.runs || [];
  const level = state?.level || 0;
  const badges = state?.badges || [];

  switch (id) {
    case 'first_workout':
      return { progress: workouts.length > 0 ? 1 : 0, maxProgress: 1 };
    case 'week_streak':
      return { progress: Math.min(streaks.current, 7), maxProgress: 7 };
    case 'month_streak':
      return { progress: Math.min(streaks.longest, 30), maxProgress: 30 };
    case 'ten_workouts':
      return { progress: Math.min(workouts.length, 10), maxProgress: 10 };
    case 'fifty_workouts':
      return { progress: Math.min(workouts.length, 50), maxProgress: 50 };
    case 'hundred_workouts':
      return { progress: Math.min(workouts.length, 100), maxProgress: 100 };
    case 'volume_1000': {
      const vol = getMaxWorkoutVolume(workouts);
      return { progress: Math.min(vol, 1000), maxProgress: 1000 };
    }
    case 'volume_5000': {
      const vol = getMaxWorkoutVolume(workouts);
      return { progress: Math.min(vol, 5000), maxProgress: 5000 };
    }
    case 'early_bird': {
      const found = workouts.some(w => new Date(w.date).getHours() < 7);
      return { progress: found ? 1 : 0, maxProgress: 1 };
    }
    case 'night_owl': {
      const found = workouts.some(w => new Date(w.date).getHours() >= 22);
      return { progress: found ? 1 : 0, maxProgress: 1 };
    }
    case 'first_meal':
      return { progress: nutrition.length > 0 ? 1 : 0, maxProgress: 1 };
    case 'nutrition_week': {
      const days = new Set(nutrition.map(n => new Date(n.date).toDateString())).size;
      return { progress: Math.min(days, 7), maxProgress: 7 };
    }
    case 'protein_hit': {
      const found = nutrition.some(n => {
        const target = n.proteinTarget || 0;
        return target > 0 && (n.protein || 0) >= target;
      });
      return { progress: found ? 1 : 0, maxProgress: 1 };
    }
    case 'calorie_master': {
      const byDay = {};
      nutrition.forEach(n => {
        const key = Math.floor(new Date(n.date).getTime() / DAY_MS);
        if (!byDay[key]) byDay[key] = { total: 0, target: n.calorieTarget || 0 };
        byDay[key].total += n.calories || 0;
        if (n.calorieTarget) byDay[key].target = n.calorieTarget;
      });
      const sortedDays = Object.keys(byDay).map(Number).sort((a, b) => b - a);
      let maxConsec = 0;
      let temp = 0;
      for (let i = 0; i < sortedDays.length; i++) {
        const { total, target } = byDay[sortedDays[i]];
        const ok = target > 0 && Math.abs(total - target) <= 100;
        if (ok && (i === 0 || sortedDays[i - 1] - sortedDays[i] === 1)) {
          temp++;
        } else if (ok) {
          temp = 1;
        } else {
          temp = 0;
        }
        maxConsec = Math.max(maxConsec, temp);
      }
      return { progress: Math.min(maxConsec, 7), maxProgress: 7 };
    }
    case 'first_run':
      return { progress: runs.length > 0 ? 1 : 0, maxProgress: 1 };
    case 'run_5k': {
      const found = runs.some(r => (r.distance || 0) >= 5);
      return { progress: found ? 1 : 0, maxProgress: 1 };
    }
    case 'run_10k': {
      const found = runs.some(r => (r.distance || 0) >= 10);
      return { progress: found ? 1 : 0, maxProgress: 1 };
    }
    case 'total_100km': {
      const total = runs.reduce((sum, r) => sum + (r.distance || 0), 0);
      return { progress: Math.min(total, 100), maxProgress: 100 };
    }
    case 'total_500km': {
      const total = runs.reduce((sum, r) => sum + (r.distance || 0), 0);
      return { progress: Math.min(total, 500), maxProgress: 500 };
    }
    case 'speed_demon': {
      const found = runs.some(r => {
        if (r.pace) {
          const parts = r.pace.split(':');
          if (parts.length === 2) {
            return parseInt(parts[0]) + parseInt(parts[1]) / 60 < 4.5;
          }
        }
        if (r.distance && r.duration) {
          return r.duration / 60 / r.distance < 4.5;
        }
        return false;
      });
      return { progress: found ? 1 : 0, maxProgress: 1 };
    }
    case 'level_5':
      return { progress: Math.min(level, 5), maxProgress: 5 };
    case 'level_10':
      return { progress: Math.min(level, 10), maxProgress: 10 };
    case 'level_25':
      return { progress: Math.min(level, 25), maxProgress: 25 };
    case 'all_rounder': {
      const cats = new Set();
      badges.forEach(b => {
        const badgeId = typeof b === 'string' ? b : b?.id;
        const a = ACHIEVEMENTS.find(x => x.id === badgeId);
        if (a) cats.add(a.category);
      });
      return { progress: Math.min(cats.size, 3), maxProgress: 3 };
    }
    default:
      return { progress: 0, maxProgress: 1 };
  }
}

function getXpForLevel(level) {
  return level * (level + 1) * 50;
}

function formatProgress(value) {
  if (value >= 100) return Math.round(value).toString();
  if (value >= 10) return Math.round(value).toString();
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export default function Achievements({ state, dispatch }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const workouts = state?.workouts || [];
  const nutrition = state?.nutrition || [];
  const runs = state?.runs || [];
  const badges = state?.badges || [];
  const xp = state?.xp || 0;
  const level = state?.level || 0;

  const streaks = useMemo(() => calculateStreaks(workouts, runs), [workouts, runs]);

  const achievementsWithStatus = useMemo(() => {
    return ACHIEVEMENTS.map(a => {
      const badge = badges.find(b => (typeof b === 'string' ? b : b?.id) === a.id);
      const isEarned = !!badge;
      const earnedAt = typeof badge === 'object' ? badge?.earnedAt : null;
      const status = checkAchievement(a.id, state, streaks);
      const percentage = status.maxProgress > 0
        ? Math.min((status.progress / status.maxProgress) * 100, 100)
        : 0;
      return { ...a, isEarned, earnedAt, ...status, percentage };
    });
  }, [state, streaks, badges]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return achievementsWithStatus;
    return achievementsWithStatus.filter(a => a.category === activeCategory);
  }, [achievementsWithStatus, activeCategory]);

  const totalEarned = achievementsWithStatus.filter(a => a.isEarned).length;
  const totalXP = achievementsWithStatus.filter(a => a.isEarned).reduce((sum, a) => sum + a.xp, 0);

  const totalXpForCurrentLevel = getXpForLevel(level);
  const xpToNext = (level + 1) * 100;
  const xpInLevel = xp - totalXpForCurrentLevel;
  const xpPercent = xpToNext > 0 ? Math.max(0, Math.min((xpInLevel / xpToNext) * 100, 100)) : 0;

  const statCards = [
    { label: 'Badges Earned', value: `${totalEarned}`, unit: ` / ${achievementsWithStatus.length}`, sub: 'Collection progress', color: 'lime', Icon: Medal },
    { label: 'Current Streak', value: `${streaks.current}`, unit: ' days', sub: 'Active streak', color: 'orange', Icon: Flame },
    { label: 'Longest Streak', value: `${streaks.longest}`, unit: ' days', sub: 'Best run', color: 'purple', Icon: Zap },
    { label: 'Total Workouts', value: workouts.length.toString(), unit: ' sessions', sub: 'All-time', color: 'blue', Icon: Dumbbell },
  ];

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><Trophy size={13} /> Achievements</span>
          <h1 className="rd-title">Badge Collection</h1>
          <p className="rd-sub">Earn badges for workouts, nutrition, running and consistency milestones.</p>
        </div>
      </div>

      <div className="rd-card">
        <div className="rd-card-head">
          <div className="rd-card-title">
            <div className="rd-card-title-ico lime"><Zap size={15} /></div>
            <div>
              <div className="rd-card-kicker">Level {level}</div>
              <div className="rd-card-name">{xpInLevel.toLocaleString()} / {xpToNext.toLocaleString()} XP to next level</div>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#C8FF00", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-0.02em", lineHeight: 1 }}>
              {totalXP.toLocaleString()}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, fontFamily: "'Inter',sans-serif" }}> XP</span>
            </div>
            <div className="rd-metric-label">Total Earned</div>
          </div>
        </div>
        <div className="rd-macro-track" style={{ height: 8 }}>
          <motion.div
            className="rd-macro-fill"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ width: `${xpPercent}%`, background: 'linear-gradient(90deg, #A5E600, #C8FF00)', boxShadow: '0 0 10px rgba(200,255,0,0.3)' }}
          />
        </div>
      </div>

      <div className="rd-nut-stats">
        {statCards.map((s) => (
          <div key={s.label} className={`rd-nut-stat ${s.color}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="l">{s.label}</span>
              <s.Icon size={15} style={{ color: "rgba(255,255,255,0.28)" }} />
            </div>
            <div className="v">{s.value}{s.unit && <span>{s.unit}</span>}</div>
            <div className="s">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="rd-card" style={{ padding: "14px 18px" }}>
        <div className="rd-filter-row">
          <span className="rd-filter-label">Category</span>
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`rd-chip ${activeCategory === cat ? "active" : ""}`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="rd-count"><b>{filtered.length}</b> badge{filtered.length !== 1 ? "s" : ""}</div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}
        >
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ gridColumn: '1 / -1' }}
            >
              <div className="rd-card rd-empty" style={{ padding: '48px 20px' }}>
                <Lock size={30} style={{ opacity: 0.3 }} />
                <div className="rd-empty-title">No achievements here yet</div>
                <div className="rd-empty-sub">Keep pushing to unlock badges in this category</div>
              </div>
            </motion.div>
          ) : filtered.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              whileHover={{
                scale: 1.02,
                boxShadow: achievement.isEarned
                  ? '0 0 24px rgba(200, 255, 0, 0.12)'
                  : '0 8px 24px rgba(0, 0, 0, 0.22)',
              }}
              className="rd-card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: achievement.isEarned
                  ? 'linear-gradient(180deg, rgba(200,255,0,0.05) 0%, rgba(19,19,19,0.6) 100%)'
                  : undefined,
                border: achievement.isEarned ? '1px solid rgba(200,255,0,0.25)' : undefined,
                opacity: achievement.isEarned ? 1 : 0.65,
              }}
            >
              {achievement.isEarned && (
                <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #C8FF00, transparent)', opacity: 0.5 }} />
              )}

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  className="rd-ex-tile"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    flexShrink: 0,
                    background: achievement.isEarned ? 'rgba(200,255,0,0.12)' : 'rgba(255,255,255,0.04)',
                    borderColor: achievement.isEarned ? 'rgba(200,255,0,0.25)' : 'rgba(255,255,255,0.07)',
                    color: achievement.isEarned ? '#C8FF00' : 'rgba(255,255,255,0.35)',
                    filter: achievement.isEarned ? 'none' : 'grayscale(1) brightness(0.6)',
                  }}
                >
                  {achievement.isEarned ? achievement.icon : <Lock size={20} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      color: achievement.isEarned ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                      fontSize: '14px',
                      fontWeight: '700',
                      lineHeight: '1.25',
                    }}>
                      {achievement.title}
                    </span>
                    {achievement.isEarned && (
                      <span className="rd-ex-tag">+{achievement.xp} XP</span>
                    )}
                  </div>

                  <div style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '12px',
                    marginTop: '4px',
                    lineHeight: '1.5',
                  }}>
                    {achievement.description}
                  </div>
                </div>
              </div>

              {achievement.isEarned && achievement.earnedAt && (
                <div style={{ color: '#C8FF00', fontSize: '11px', opacity: 0.75, marginTop: '8px', fontFamily: "'JetBrains Mono',monospace" }}>
                  Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                </div>
              )}

              {!achievement.isEarned && achievement.maxProgress > 1 && (
                <div className="rd-macro" style={{ marginTop: '10px', marginBottom: 0 }}>
                  <div className="rd-macro-head">
                    <span className="rd-macro-label">{formatProgress(achievement.progress)} / {achievement.maxProgress}</span>
                    <span className="rd-macro-val">{Math.round(achievement.percentage)}%</span>
                  </div>
                  <div className="rd-macro-track" style={{ height: 4 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.04 }}
                      style={{ width: `${achievement.percentage}%`, height: '100%', borderRadius: 4, background: '#C8FF00' }}
                    />
                  </div>
                </div>
              )}

              {!achievement.isEarned && achievement.maxProgress === 1 && (
                <span className="rd-ex-tag muted" style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', display: 'inline-block' }} />
                  Not started
                </span>
              )}

              {achievement.isEarned && (
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#C8FF00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0B0B0B',
                  boxShadow: '0 4px 14px rgba(200, 255, 0, 0.35)',
                }}>
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
