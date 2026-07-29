export const calcE1RM = (w, r) => r === 1 ? w : w * (1 + r / 30);

export const calcVolume = (sets) => sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);

export const calcWeeklyVolume = (workouts) => {
  const d = new Date(); d.setDate(d.getDate() - 7);
  const wa = d.toISOString().split("T")[0];
  return workouts.filter(w => w.date >= wa).reduce((sum, w) => sum + w.totalVolume, 0);
};

export const calcStreak = (workouts) => {
  const days = [...new Set(workouts.map(w => w.date))].sort().reverse();
  let streak = 0;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  for (let i = 0; i < days.length; i++) {
    const d = new Date(days[i]); d.setHours(0, 0, 0, 0);
    const diff = Math.round((now - d) / 86400000);
    if (diff === streak) streak++;
    else break;
  }
  return streak;
};

export const calcCalories = (distanceKm, durationSeconds, weightKg = 70) => {
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

export const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
